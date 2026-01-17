const JobPosting = require('../models/JobPosting');

exports.createJob = async (req, res) => {
  try {
    const body = req.body;
    // Basic validation
    if (!body.title || !body.description || !body.department || !body.responsibilities || !body.qualifications) {
      return res.status(400).json({ message: 'Missing required job fields (title, description, department, responsibilities, qualifications)' });
    }
    const job = new JobPosting({ ...body, postedBy: req.admin._id });
    await job.save();
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    Object.assign(job, req.body);
    await job.save();
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id).populate('postedBy', '-password -__v');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    // If public access, ensure job is open
    if (!req.admin && job.status !== 'open') return res.status(404).json({ message: 'Job not found' });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listPublicJobs = async (req, res) => {
  try {
    const { department, q, page = 1, limit = 10, tags } = req.query;
    const filter = { status: 'open' };
    if (department) filter.department = department;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(',') };
    const jobs = await JobPosting.find(filter).sort({ postedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10));
    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listAdminJobs = async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    const jobs = await JobPosting.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10));
    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
