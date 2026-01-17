const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const transporter = require("../config/mailer");

router.post("/submit", async (req, res) => {
  try {
    const { name, email, company, projectType, message, timeline } = req.body;

    // Validation
    if (!name || !email || !company || !projectType || !message || !timeline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Store in DB
    const inquiry = await Inquiry.create({
      name,
      email,
      company,
      projectType,
      message,
      timeline
    });

    // Send Email
    await transporter.sendMail({
      from: `"New Inquiry" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: "New Project Inquiry Received",
      html: `
        <h3>New Inquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Project Type:</b> ${projectType}</p>
        <p><b>Timeline:</b> ${timeline}</p>
        <p><b>Message:</b><br/>${message}</p>
      `
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      data: inquiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/inquiry/ - fetch all received inquiries (mails)
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ count: inquiries.length, data: inquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
