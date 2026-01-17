import express from "express"
import Contact from "../models/Contact.js"
import transporter from "../config/mailer.js"

const router = express.Router()

router.post("/contact", async (req, res) => {
  const { name, email, company, projectType, message, timeline } = req.body

  if (!name || !email || !projectType || !message) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    // 1. Store in DB
    const savedLead = await Contact.create({
      name,
      email,
      company,
      projectType,
      timeline,
      message,
    })

    // 2. Send email
await transporter.sendMail({
  from: `"CryptoCortex Crew" <${process.env.EMAIL_USER}>`,
  to: process.env.RECEIVER_EMAIL,
  subject: `🌌 New Project Inquiry – ${name}`,
  html: `
  <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px 0; font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
      
      <!-- Futuristic Header -->
      <div style="background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%); padding: 32px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format') center/cover; opacity: 0.1;"></div>
        <div style="position: relative; z-index: 2;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);">
            🌟 NEW PROJECT INQUIRY
          </h1>
          <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
            ━━━━━━━━━━━━━━━━━━━
          </p>
        </div>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px; color: #ffffff;">
        
        <!-- Intro -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: linear-gradient(90deg, #ff0080, #ff8c00); padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
            🚀 FUTURE-READY PROJECT
          </div>
          <p style="font-size: 14px; margin-top: 15px; color: #a0a0c0; line-height: 1.6;">
            A new project inquiry has been submitted through the portal
          </p>
        </div>
        
        <!-- Glowing Data Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
          <div style="background: rgba(0, 219, 222, 0.1); border: 1px solid rgba(0, 219, 222, 0.3); border-radius: 15px; padding: 18px; backdrop-filter: blur(5px);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #00dbde, #0099ff); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                👤
              </div>
              <div>
                <div style="font-size: 11px; color: #00dbde; font-weight: bold; letter-spacing: 1px;">CONTACT</div>
                <div style="font-size: 16px; font-weight: bold; margin-top: 2px;">${name}</div>
              </div>
            </div>
          </div>
          
          <div style="background: rgba(252, 0, 255, 0.1); border: 1px solid rgba(252, 0, 255, 0.3); border-radius: 15px; padding: 18px; backdrop-filter: blur(5px);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #fc00ff, #ff0080); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                📧
              </div>
              <div>
                <div style="font-size: 11px; color: #fc00ff; font-weight: bold; letter-spacing: 1px;">EMAIL</div>
                <div style="font-size: 14px; margin-top: 2px; word-break: break-all;">${email}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Company Info -->
        <div style="background: rgba(255, 140, 0, 0.1); border: 1px solid rgba(255, 140, 0, 0.3); border-radius: 15px; padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff8c00, #ff0080); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
              🏢
            </div>
            <div>
              <div style="font-size: 11px; color: #ff8c00; font-weight: bold; letter-spacing: 1px;">COMPANY / ORGANIZATION</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 2px;">${company || "Not specified"}</div>
            </div>
          </div>
        </div>
        
        <!-- Project Details -->
        <div style="display: flex; gap: 15px; margin: 25px 0;">
          <div style="flex: 1; background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2)); border: 1px solid rgba(147, 51, 234, 0.4); border-radius: 15px; padding: 18px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; background: rgba(147, 51, 234, 0.3); border-radius: 50%;"></div>
            <div style="font-size: 11px; color: #c084fc; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px;">PROJECT TYPE</div>
            <div style="font-size: 18px; font-weight: bold; color: #f0abfc;">${projectType}</div>
          </div>
          
          <div style="flex: 1; background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2)); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 15px; padding: 18px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; background: rgba(52, 211, 153, 0.3); border-radius: 50%;"></div>
            <div style="font-size: 11px; color: #34d399; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px;">TIMELINE</div>
            <div style="font-size: 18px; font-weight: bold; color: #a7f3d0;">${timeline || "Flexible"}</div>
          </div>
        </div>
        
        <!-- Project Description -->
        <div style="margin-top: 30px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              📝
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #60a5fa;">PROJECT DESCRIPTION</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 22px; border-radius: 15px; font-size: 14px; line-height: 1.7; color: #d1d5db;">
            ${message}
          </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(90deg, #00dbde, #fc00ff); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; letter-spacing: 1px; font-size: 14px; transition: all 0.3s; box-shadow: 0 0 20px rgba(0, 219, 222, 0.5);">
            ✨ REPLY TO CLIENT
          </a>
        </div>
        
      </div>
      
      <!-- Futuristic Footer -->
      <div style="background: rgba(0, 0, 0, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="font-size: 11px; color: #8a8aa3; letter-spacing: 2px; margin-bottom: 10px;">
          ⚡ CRYPTOCORTEX CREW
        </div>
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 15px;">
          <div style="width: 8px; height: 8px; background: #00dbde; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: #fc00ff; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: #ff8c00; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: #34d399; border-radius: 50%;"></div>
        </div>
        <div style="font-size: 10px; color: #6b7280;">
          © ${new Date().getFullYear()} CryptoCortex Crew • Digital Innovation Portal
        </div>
        <div style="font-size: 9px; color: #4b5563; margin-top: 8px;">
          This message was generated from your website contact form
        </div>
      </div>
    </div>
  </div>
  `,
})

    res.json({
      success: true,
      id: savedLead._id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Submission failed" })
  }
})

export default router
