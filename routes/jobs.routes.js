const express = require('express');
const router = express.Router();
const auth = require('../src/middleware/auth');
const JobPosting = require('../models/JobPosting');

// Public listing: GET /api/jobs/public
router.get('/public', async (req, res) => {
	console.log(`[API TRACK] Public job listing - Query: ${JSON.stringify(req.query)}, IP: ${req.ip}`);
	try {
		const { department, q, page = 1, limit = 10, tags } = req.query;
		const filter = { status: 'open' };
		if (department) filter.department = department;
		if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
		if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(',') };
		const p = Math.max(1, parseInt(page, 10));
		const l = Math.min(100, parseInt(limit, 10));
		const jobs = await JobPosting.find(filter).sort({ postedAt: -1 }).skip((p - 1) * l).limit(l);
		console.log(`[API TRACK] Public job listing successful - Count: ${jobs.length}`);
		return res.json(jobs);
	} catch (err) {
		console.log(`[API TRACK] Public job listing error - ${err.message}`);
		return res.status(500).json({ message: err.message });
	}
});

// Public job detail (if open) or visible to admin
router.get('/:id', async (req, res) => {
	console.log(`[API TRACK] Get job detail - JobID: ${req.params.id}, Admin: ${req.admin ? req.admin._id : 'Public'}, IP: ${req.ip}`);
	try {
		const job = await JobPosting.findById(req.params.id).populate('postedBy', '-password -__v');
		if (!job) {
			console.log(`[API TRACK] Get job failed - Not found: ${req.params.id}`);
			return res.status(404).json({ message: 'Job not found' });
		}
		if (!req.admin && job.status !== 'open') {
			console.log(`[API TRACK] Get job failed - Not open: ${req.params.id}`);
			return res.status(404).json({ message: 'Job not found' });
		}
		console.log(`[API TRACK] Get job successful - JobID: ${req.params.id}`);
		return res.json(job);
	} catch (err) {
		console.log(`[API TRACK] Get job error - ${err.message}`);
		return res.status(500).json({ message: err.message });
	}
});

// Admin: create job
router.post('/', auth, async (req, res) => {
	console.log(`[API TRACK] Create job - Admin: ${req.admin._id}, Title: ${req.body.title}, IP: ${req.ip}`);
    try {
        const body = req.body;
        if (!body.title || !body.description || !body.department || !body.responsibilities || !body.qualifications) {
			console.log(`[API TRACK] Create job failed - Missing fields`);
            return res.status(400).json({ message: 'Missing required job fields (title, description, department, responsibilities, qualifications)' });
        }
        if (!Array.isArray(body.responsibilities) || body.responsibilities.length === 0) {
			console.log(`[API TRACK] Create job failed - No responsibilities`);
            return res.status(400).json({ message: 'At least one responsibility is required' });
        }
        if (!Array.isArray(body.qualifications) || body.qualifications.length === 0) {
			console.log(`[API TRACK] Create job failed - No qualifications`);
            return res.status(400).json({ message: 'At least one qualification is required' });
        }
        const job = new JobPosting({ ...body, postedBy: req.admin._id });
        await job.save();
		console.log(`[API TRACK] Create job successful - JobID: ${job._id}`);
        return res.status(201).json(job);
    } catch (err) {
		console.log(`[API TRACK] Create job error - ${err.message}`);
        return res.status(500).json({ message: err.message });
    }
});

// Admin: list jobs with filters
router.get('/',  async (req, res) => {
	console.log(`[API TRACK] Admin list jobs - Admin: ${req.admin ? req.admin._id : 'None'}, Query: ${JSON.stringify(req.query)}, IP: ${req.ip}`);
	try {
		const { status, department, page = 1, limit = 20 } = req.query;
		const filter = {};
		if (status) filter.status = status;
		if (department) filter.department = department;
		const p = Math.max(1, parseInt(page, 10));
		const l = Math.min(200, parseInt(limit, 10));
		const jobs = await JobPosting.find(filter).sort({ updatedAt: -1 }).skip((p - 1) * l).limit(l);
		console.log(`[API TRACK] Admin list jobs successful - Count: ${jobs.length}`);
		return res.json(jobs);
	} catch (err) {
		console.log(`[API TRACK] Admin list jobs error - ${err.message}`);
		return res.status(500).json({ message: err.message });
	}
});

// Admin: update job
router.put('/:id',  async (req, res) => {
	console.log(`[API TRACK] Update job - JobID: ${req.params.id}, Admin: ${req.admin ? req.admin._id : 'None'}, Updates: ${JSON.stringify(req.body)}, IP: ${req.ip}`);
	try {
		const job = await JobPosting.findById(req.params.id);
		if (!job) {
			console.log(`[API TRACK] Update job failed - Not found: ${req.params.id}`);
			return res.status(404).json({ message: 'Job not found' });
		}
		Object.assign(job, req.body);
		await job.save();
		console.log(`[API TRACK] Update job successful - JobID: ${req.params.id}`);
		return res.json(job);
	} catch (err) {
		console.log(`[API TRACK] Update job error - ${err.message}`);
		return res.status(500).json({ message: err.message });
	}
});

// Admin: delete job
router.delete('/:id',  async (req, res) => {
	console.log(`[API TRACK] Delete job - JobID: ${req.params.id}, Admin: ${req.admin ? req.admin._id : 'None'}, IP: ${req.ip}`);
	try {
		const job = await JobPosting.findByIdAndDelete(req.params.id);
		if (!job) {
			console.log(`[API TRACK] Delete job failed - Not found: ${req.params.id}`);
			return res.status(404).json({ message: 'Job not found' });
		}
		console.log(`[API TRACK] Delete job successful - JobID: ${req.params.id}`);
		return res.json({ message: 'Job deleted' });
	} catch (err) {
		console.log(`[API TRACK] Delete job error - ${err.message}`);
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;
