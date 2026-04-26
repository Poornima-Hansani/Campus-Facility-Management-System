const express = require("express");
const router = express.Router();
const FacilityReport = require("../models/FacilityReport");

const staffMembers = [
  { id: 'STF001', name: 'Kamal Perera', role: 'Electrician', specialty: 'A/C & Electronics', phone: '+94 71 234 5678', email: 'kamal@university.edu', activeTasks: 2, workloadStatus: 'Medium' },
  { id: 'STF002', name: 'Sunil Fernando', role: 'Plumber', specialty: 'Water & Drainage', phone: '+94 71 345 6789', email: 'sunil@university.edu', activeTasks: 0, workloadStatus: 'Free' },
  { id: 'STF003', name: 'Nimal Silva', role: 'Cleaner', specialty: 'Hygiene & Sanitation', phone: '+94 71 456 7890', email: 'nimal@university.edu', activeTasks: 1, workloadStatus: 'Medium' },
  { id: 'STF004', name: 'Ranjith Jayawardena', role: 'Technician', specialty: 'General Repairs', phone: '+94 71 567 8901', email: 'ranjith@university.edu', activeTasks: 3, workloadStatus: 'Busy' },
  { id: 'STF005', name: 'Priya Kumari', role: 'Supervisor', specialty: 'All Rounder', phone: '+94 71 678 9012', email: 'priya@university.edu', activeTasks: 0, workloadStatus: 'Free' }
];

const staffNames = {
  'STF001': 'Kamal Perera',
  'STF002': 'Sunil Fernando',
  'STF003': 'Nimal Silva',
  'STF004': 'Ranjith Jayawardena',
  'STF005': 'Priya Kumari'
};

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

router.get("/staff", (req, res) => {
  res.json({ staff: staffMembers });
});

router.post("/assign", async (req, res) => {
  try {
    const { ids, staffId } = req.body;
    if (!ids || !staffId) {
      return res.status(400).json({ error: "Missing ids or staffId" });
    }

    const staffName = staffNames[staffId];
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