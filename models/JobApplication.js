const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  originalName: { type: String, required: true }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  startDate: Date,
  endDate: Date,
  description: String
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startDate: Date,
  endDate: Date
}, { _id: false });

const JobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  resume: { type: ResumeSchema, required: true },
  coverLetter: { type: String },
  experiences: { type: [ExperienceSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
  skills: { type: [String], default: [] },
  status: { type: String, enum: ['submitted','screening','interview','offered','hired','rejected'], default: 'submitted', index: true },
  termsAccepted: { type: Boolean, required: true },
  appliedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  notes: { type: [String], default: [] }
}, { timestamps: true });

// Enforce unique applicant email per job posting
JobApplicationSchema.index({ job: 1, email: 1 }, { unique: true });

// Additional index for sorting/filtering
JobApplicationSchema.index({ job: 1, status: 1, appliedAt: -1 });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
