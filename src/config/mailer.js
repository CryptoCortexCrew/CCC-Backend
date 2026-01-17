import nodemailer from "nodemailer"
import logger from "./logger.js"

const host = process.env.SMTP_HOST || process.env.SMTP_SERVER || "smtp.gmail.com"
const port = parseInt(process.env.SMTP_PORT || "587", 10)
const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true" // true for 465

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
    // Allow self-signed certs when explicitly enabled (not recommended for production)
    rejectUnauthorized: (process.env.SMTP_TLS_REJECT_UNAUTHORIZED || "true").toLowerCase() === "true",
  },
})

// Verify transporter at startup (non-blocking)
transporter.verify((err, success) => {
  if (err) {
    logger.error("SMTP verify failed", err)
  } else {
    logger.info("SMTP transporter ready")
  }
})

async function sendMail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions)
    logger.info("Email sent", info)
    return info
  } catch (err) {
    logger.error("Email send failed", err)
    // Re-throw so callers can decide how to handle it, but keep logging the failure
    throw err
  }
}

export { transporter, sendMail }
