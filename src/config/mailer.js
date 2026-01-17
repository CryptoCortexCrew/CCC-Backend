import fs from "fs"
import path from "path"
import nodemailer from "nodemailer"
import logger from "./logger.js"

// SendGrid API (preferred in production) - optional dependency
let sendgrid
try {
  // lazy-load to avoid requiring the package if not used
  // user must `npm install @sendgrid/mail` to enable
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sendgrid = await import("@sendgrid/mail")
} catch (e) {
  // not installed or not available; we'll fallback to SMTP
  sendgrid = null
}

const useSendGrid = Boolean(process.env.SENDGRID_API_KEY) && sendgrid
if (useSendGrid) {
  sendgrid.default.setApiKey(process.env.SENDGRID_API_KEY)
  logger.info("SendGrid configured as email provider")
}

const host = process.env.SMTP_HOST || process.env.SMTP_SERVER || "smtp.gmail.com"
const port = parseInt(process.env.SMTP_PORT || "587", 10)
const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true"

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: process.env.EMAIL_USER
    ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    : undefined,
  pool: (process.env.SMTP_POOL || "true").toLowerCase() === "true",
  connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || "10000", 10),
  greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || "5000", 10),
  tls: {
    rejectUnauthorized: (process.env.SMTP_TLS_REJECT_UNAUTHORIZED || "true").toLowerCase() === "true",
  },
})

transporter.verify((err) => {
  if (err) logger.error("SMTP verify failed", err)
  else logger.info("SMTP transporter ready")
})

// Ensure outbox directory exists
const outboxDir = path.join(process.cwd(), "outbox")
if (!fs.existsSync(outboxDir)) fs.mkdirSync(outboxDir, { recursive: true })

async function writeOutbox(mailOptions, err) {
  try {
    const filename = `failed-email-${Date.now()}.json`
    const filepath = path.join(outboxDir, filename)
    const payload = { mailOptions, error: (err && (err.message || String(err))) || null, ts: new Date().toISOString() }
    await fs.promises.writeFile(filepath, JSON.stringify(payload, null, 2), "utf8")
    logger.info("Wrote failed email to outbox", { path: filepath })
  } catch (e) {
    logger.error("Failed to write outbox file", e)
  }
}

async function sendMail(mailOptions) {
  // If SendGrid API key is available, use it (preferred for hosted platforms)
  if (useSendGrid) {
    try {
      const msg = {
        to: mailOptions.to,
        from: mailOptions.from || process.env.EMAIL_USER,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
      }
      const res = await sendgrid.default.send(msg)
      logger.info("Email sent via SendGrid", { result: Array.isArray(res) ? res[0].statusCode : res.statusCode })
      return res
    } catch (err) {
      logger.error("SendGrid send failed", err)
      // fallback to SMTP below
      await writeOutbox(mailOptions, err)
      throw err
    }
  }

  // Fallback to SMTP transport
  try {
    const info = await transporter.sendMail(mailOptions)
    logger.info("Email sent via SMTP", info)
    return info
  } catch (err) {
    logger.error("SMTP send failed", err)
    await writeOutbox(mailOptions, err)
    throw err
  }
}

export { transporter, sendMail }
