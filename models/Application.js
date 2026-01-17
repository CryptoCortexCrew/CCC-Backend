const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    school: String,
    college: String,
    degree: String,
    graduationYear: String
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    pastExperience: String,
    internExperience: String,
    currentCompany: String,
    experienceYears: String
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    resumeFile: { type: String, required: true },
    resumeFileName: { type: String },
    education: { type: [educationSchema], required: true },
    experiences: { type: [experienceSchema], required: true },
    certifications: { type: String },
    coverLetter: { type: String },
    acceptTerms: { type: Boolean, required: true },
    acceptPrivacy: { type: Boolean, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    status: { type: String, default: "submitted", index: true },
    reviewedDate: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    notes: { type: String }
  },
  { timestamps: { createdAt: "submittedDate", updatedAt: "updatedDate" } }
);

// unique email per job
applicationSchema.index({ email: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
