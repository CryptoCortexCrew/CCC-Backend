const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true, index: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: String },
    description: { type: String, required: true },
    skills: { type: [String], required: true },
    responsibilities: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    gradient: { type: String },
    status: { type: String, default: "active", index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    applicationCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
