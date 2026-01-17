const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');

const allowedTransitions = {
  submitted: ['screening','rejected'],
  screening: ['interview','rejected'],
  interview: ['offered','rejected'],
  offered: ['hired','rejected'],
  rejected: [],
  hired: []
};

exports.applyToJob = async (req, res) => {
  console.log(`[API TRACK] Apply to job started - JobID: ${req.params.jobId}, Email: ${req.body.email}, IP: ${req.ip}`);
  try {
    const { jobId } = req.params;
    const { firstName, lastName, email, phone, coverLetter, termsAccepted } = req.body;
    if (!firstName || !email || !termsAccepted) {
      console.log(`[API TRACK] Apply failed - Missing fields: ${JSON.stringify({ firstName, email, termsAccepted })}`);
      return res.status(400).json({ message: 'Missing required fields: firstName, email, termsAccepted' });
    }

    const job = await JobPosting.findById(jobId);
    if (!job || job.status !== 'open') {
      console.log(`[API TRACK] Apply failed - Job not found or not open: ${jobId}`);
      return res.status(404).json({ message: 'Job not found or not open' });
    }

    if (!req.file) {
      console.log(`[API TRACK] Apply failed - No resume file uploaded`);
      return res.status(400).json({ message: 'Resume file is required' });
    }
    // Store resume in DB
    const application = new JobApplication({
      job: job._id,
      firstName,
      lastName,
      email,
      phone,
      resume: {
        data: req.file.buffer,
        size: req.file.size,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname
      },
      coverLetter,
      termsAccepted: termsAccepted === 'true' || termsAccepted === true
    });
    await application.save();
    console.log(`[API TRACK] Apply successful - ApplicationID: ${application._id}, JobID: ${jobId}`);
    return res.status(201).json(application);
  } catch (err) {
    console.log(`[API TRACK] Apply error - ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

exports.listApplicationsForJob = async (req, res) => {
  console.log(`[API TRACK] List applications for job - JobID: ${req.params.jobId}, Admin: ${req.admin ? req.admin._id : 'Public'}, IP: ${req.ip}`);
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20, sort = '-appliedAt' } = req.query;
    const filter = { job: jobId };
    if (status) filter.status = status;
    const apps = await JobApplication.find(filter).sort(sort).skip((page - 1) * limit).limit(parseInt(limit, 10));
    console.log(`[API TRACK] List applications successful - Count: ${apps.length}, JobID: ${jobId}`);
    return res.json(apps);
  } catch (err) {
    console.log(`[API TRACK] List applications error - ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

exports.getApplication = async (req, res) => {
  console.log(`[API TRACK] Get application - AppID: ${req.params.id}, Admin: ${req.admin ? req.admin._id : 'Public'}, IP: ${req.ip}`);
  try {
    const app = await JobApplication.findById(req.params.id).populate('job');
    if (!app) {
      console.log(`[API TRACK] Get application failed - Not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Application not found' });
    }
    console.log(`[API TRACK] Get application successful - AppID: ${req.params.id}`);
    return res.json(app);
  } catch (err) {
    console.log(`[API TRACK] Get application error - ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  console.log(`[API TRACK] Update application status - AppID: ${req.params.id}, NewStatus: ${req.body.status}, Admin: ${req.admin._id}, IP: ${req.ip}`);
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) {
      console.log(`[API TRACK] Update status failed - Not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Application not found' });
    }
    const { status } = req.body;
    if (!status) {
      console.log(`[API TRACK] Update status failed - No status provided`);
      return res.status(400).json({ message: 'Status is required' });
    }
    const allowed = allowedTransitions[app.status] || [];
    if (!allowed.includes(status)) {
      console.log(`[API TRACK] Update status failed - Invalid transition: ${app.status} -> ${status}`);
      return res.status(400).json({ message: `Invalid status transition from ${app.status} to ${status}` });
    }
    app.status = status;
    if (req.admin) app.reviewedBy = req.admin._id;
    await app.save();
    console.log(`[API TRACK] Update status successful - AppID: ${req.params.id}, Status: ${status}`);
    return res.json(app);
  } catch (err) {
    console.log(`[API TRACK] Update status error - ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};
