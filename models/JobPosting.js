const mongoose = require('mongoose');

const SalaryRangeSchema = new mongoose.Schema({
  min: { type: Number },
  max: { type: Number }
}, { _id: false });

const JobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department: { type: String, required: true, index: true },
  location: { type: String },
  employmentType: { type: String, enum: ['full-time','part-time','contract','temporary','internship','freelance'] },
  salaryRange: SalaryRangeSchema,
  responsibilities: { type: [String], validate: { validator: v => Array.isArray(v) && v.length > 0, message: 'At least one responsibility is required' } },
  qualifications: { type: [String], validate: { validator: v => Array.isArray(v) && v.length > 0, message: 'At least one qualification is required' } },
  isRemote: { type: Boolean, default: false },
  status: { type: String, enum: ['draft','open','closed'], default: 'draft', index: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  postedAt: { type: Date, default: Date.now },
  closingDate: { type: Date },
  tags: { type: [String], default: [] },
}, { timestamps: true });

// Compound index to optimize admin filters and public listing
JobPostingSchema.index({ status: 1, department: 1, postedAt: -1 });

module.exports = mongoose.model('JobPosting', JobPostingSchema);
