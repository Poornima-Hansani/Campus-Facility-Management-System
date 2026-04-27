const express = require("express");
const router = express.Router();
const FacilityReport = require("../models/FacilityReport");

const User = require('../models/User');

router.get("/dashboard", async (req, res) => {
  try {
    const allReports = await FacilityReport.find().sort({ createdAt: -1 });
    
    const escalated = allReports.filter(r => r.status === 'Pending' && r.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000));
    const pending = allReports.filter(r => r.status === 'Pending');
    const assigned = allReports.filter(r => r.status === 'Assigned' || r.status === 'InProgress');
    
    const escalatedGroups = [];
    const grouped = {};
    for (const r of escalated) {
      const key = `${r.location}-${r.issueType}`;
      if (!grouped[key]) {
        grouped[key] = { location: r.location, issueType: r.issueType, count: 0, ids: [] };
      }
      grouped[key].count++;
      grouped[key].ids.push(r.id);
    }
    Object.values(grouped).forEach(g => {
      escalatedGroups.push({
        location: g.location,
        issueType: g.issueType,
        count: g.count,
        ids: g.ids,
        missingStaff: true
      });
    });

    const totalReports = allReports.length;
    const fixedReports = allReports.filter(r => r.status === 'Fixed').length;
    const ratings = allReports.filter(r => r.rating).map(r => r.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    const responseTimes = allReports.filter(r => r.status === 'Fixed').map(r => {
      const created = new Date(r.createdAt).getTime();
      const updated = new Date(r.updatedAt).getTime();
      return (updated - created) / (1000 * 60);
    });
    const avgResponseTime = responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

    res.json({
      stats: { totalReports, fixedReports, avgRating: Number(avgRating), avgResponseTime },
      escalated: escalatedGroups,
      pending: pending.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId,
        location: r.location,
        issueType: r.issueType,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt
      })),
      assigned: assigned.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId,
        location: r.location,
        issueType: r.issueType,
        comment: r.comment,
        status: r.status,
        assignedTo: r.assignedTo,
        assignedToId: r.assignedToId,
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/charts", async (req, res) => {
  try {
    const allReports = await FacilityReport.find();
    
    const byLocation = {};
    const byIssueType = {};
    const byStatus = {};
    const weeklyTrend = {};
    
    for (const r of allReports) {
      byLocation[r.location] = (byLocation[r.location] || 0) + 1;
      byIssueType[r.issueType] = (byIssueType[r.issueType] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      
      const date = new Date(r.createdAt).toISOString().slice(0, 10);
      weeklyTrend[date] = (weeklyTrend[date] || 0) + 1;
    }

    res.json({
      byLocation: Object.entries(byLocation).map(([location, count]) => ({ location, count })),
      byIssueType: Object.entries(byIssueType).map(([issueType, count]) => ({ issueType, count })),
      byStatus,
      weeklyTrend: Object.entries(weeklyTrend).map(([date, count]) => ({ date, count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/weekly-summary", async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const reports = await FacilityReport.find({ createdAt: { $gte: weekAgo } });
    const fixed = await FacilityReport.find({ 
      status: 'Fixed',
      updatedAt: { $gte: weekAgo }
    });
    
    const totalReports = reports.length;
    const fixedReports = fixed.length;
    const resolutionRate = totalReports > 0 ? Math.round((fixedReports / totalReports) * 100) : 0;
    
    const responseTimes = fixed.map(r => {
      const created = new Date(r.createdAt).getTime();
      const updated = new Date(r.updatedAt).getTime();
      return (updated - created) / (1000 * 60);
    });
    const avgResponseTime = responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

    res.json({
      summary: { totalReports, fixedReports, avgResponseTime, resolutionRate }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, { userId: 1, email: 1, name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' });
    const formattedStaff = staff.map(s => ({
      id: s.userId,
      name: s.name,
      role: 'Staff',
      specialty: s.specialization || 'General',
      workloadStatus: 'Free',
      activeTasks: 0
    }));
    res.json({ staff: formattedStaff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/assign", async (req, res) => {
  try {
    const { ids, staffId } = req.body;
    if (!ids || !staffId) {
      return res.status(400).json({ error: "Missing ids or staffId" });
    }

    const user = await User.findOne({ userId: staffId, role: 'staff' });
    const staffName = user ? user.name : staffId;
    
    await FacilityReport.updateMany(
      { _id: { $in: ids } },
      { 
        status: 'Assigned',
        assignedTo: staffName,
        assignedToId: staffId,
        updatedAt: new Date()
      }
    );

    res.json({ success: true, message: `Assigned to ${staffName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fix", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ error: "Missing ids" });
    }

    await FacilityReport.updateMany(
      { _id: { $in: ids } },
      { status: 'Fixed', updatedAt: new Date() }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/report", async (req, res) => {
  try {
    const { studentId, location, issueType, comment } = req.body;
    if (!studentId || !location || !issueType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = new FacilityReport({
      studentId,
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

module.exports = router;