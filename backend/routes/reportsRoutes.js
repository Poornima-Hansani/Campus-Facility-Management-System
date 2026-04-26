const express = require("express");
const router = express.Router();
const FacilityReport = require("../models/FacilityReport");

router.post("/", async (req, res) => {
  try {
    const { location, issueType, comment, studentId, email, phone } = req.body;
    
    const report = new FacilityReport({
      studentId: studentId || 'anonymous',
      location,
      issueType,
      comment,
      status: 'Pending'
    });
    await report.save();

    res.json({ success: true, report: { id: report._id.toString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const { location, issueType } = req.query;
    const count = await FacilityReport.countDocuments({ location, issueType, status: 'Pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const reports = await FacilityReport.find().sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const reports = await FacilityReport.find({ studentId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/rate", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    await FacilityReport.findByIdAndUpdate(id, { rating });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;