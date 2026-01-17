const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    projectType: { type: String, required: true },
    message: { type: String, required: true },
    timeline: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
