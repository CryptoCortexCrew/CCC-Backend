const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const auth = require("../src/middleware/auth");

// GET /api/admin/inquiries - paginated, searchable
router.get("/", auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const q = {};
    if (req.query.status) q.status = req.query.status; // optional field
    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      q.$or = [{ name: re }, { email: re }, { company: re }, { message: re }];
    }

    const [count, data] = await Promise.all([
      Inquiry.countDocuments(q),
      Inquiry.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);

    res.status(200).json({ count, page, limit, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single inquiry
router.get("/:id", auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ data: inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update inquiry (mark read/archive, add note)
router.put("/:id", auth, async (req, res) => {
  try {
    const allowed = ["status", "note"];
    const updates = {};
    allowed.forEach((k) => { if (k in req.body) updates[k] = req.body[k]; });
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete inquiry
router.delete("/:id", auth, async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard stats
router.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const total = await Inquiry.countDocuments();
    const recent = await Inquiry.find().sort({ createdAt: -1 }).limit(5);
    const unread = await Inquiry.countDocuments({ status: { $ne: "read" } });
    const archived = await Inquiry.countDocuments({ status: "archived" });
    res.status(200).json({ total, unread, archived, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
