const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store for the presentation demo
let reports = [];

// Helper ID logic
const generateId = () => Math.random().toString(36).substr(2, 9);

// POST /api/reports - Submit a new issue
app.post('/api/reports', (req, res) => {
  console.log('Received POST /api/reports:', req.body);
  const { location, issueType, comment, studentId } = req.body;
  if (!location || !issueType) {
    return res.status(400).json({ error: 'Location and Issue Type are required' });
  }

  // Prevent immediate duplicates from the same student for the exact same issue and location not fixed yet
  const isDuplicate = reports.some(r => r.studentId === studentId && r.location === location && r.issueType === issueType && r.status !== 'Fixed');
  if (isDuplicate) {
    return res.status(400).json({ error: 'You have already reported this issue.' });
  }

  const newReport = {
    id: generateId(),
    studentId: studentId || 'STU12345',
    location,
    issueType,
    comment,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    rating: null
  };

  reports.push(newReport);

  // Escalate Logic: If 5 or more 'Pending' reports for same location & issueType -> change to 'Action Required'
  const matchingReports = reports.filter(r => r.location === location && r.issueType === issueType && r.status === 'Pending');
  
  if (matchingReports.length >= 5) {
    matchingReports.forEach(r => {
      r.status = 'Action Required';
    });
  }

  res.status(201).json({ message: 'Success', report: newReport });
});

// GET /api/reports - Get student's report history
app.get('/api/reports', (req, res) => {
  const { studentId } = req.query;
  const studentReports = reports.filter(r => r.studentId === studentId);
  studentReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reports: studentReports });
});

// POST /api/reports/:id/rate - Submit rating for a fixed issue
app.post('/api/reports/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const report = reports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  if (report.status !== 'Fixed') return res.status(400).json({ error: 'Can only rate fixed issues.' });
  if (report.rating) return res.status(400).json({ error: 'Already rated.' });

  report.rating = rating;
  res.json({ message: 'Rating submitted.' });
});

// GET /api/management/dashboard - Get management dashboard data
app.get('/api/management/dashboard', (req, res) => {
  const totalReports = reports.length;
  const fixedReports = reports.filter(r => r.status === 'Fixed').length;
  
  const ratedReports = reports.filter(r => r.rating !== null);
  const avgRating = ratedReports.length 
    ? (ratedReports.reduce((sum, r) => sum + r.rating, 0) / ratedReports.length) 
    : 0;

  // Group escalations (Pending or Action Required)
  const groupMap = {};
  reports.forEach(r => {
    if (r.status === 'Fixed') return;
    const key = `${r.location}|${r.issueType}`;
    if (!groupMap[key]) {
      groupMap[key] = { location: r.location, issueType: r.issueType, count: 0, status: r.status, ids: [] };
    }
    groupMap[key].count += 1;
    groupMap[key].ids.push(r.id);
    if (r.status === 'Action Required') groupMap[key].status = 'Action Required';
  });

  const escalated = Object.values(groupMap).filter(g => g.count >= 5 || g.status === 'Action Required');

  res.json({
    stats: { totalReports, fixedReports, avgRating },
    escalated
  });
});

// POST /api/management/fix - Mark group of issues as fixed
app.post('/api/management/fix', (req, res) => {
  const { ids } = req.body;
  
  ids.forEach(id => {
    const report = reports.find(r => r.id === id);
    if (report && report.status !== 'Fixed') {
      report.status = 'Fixed';
    }
  });

  res.json({ message: 'Marked as fixed' });
});

// Add some dummy initial data to show in presentation without 5 clicks
reports.push({ id: generateId(), studentId: 'OTHER_STU', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 86400000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU2', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 80000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU3', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 76000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU4', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 66000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU5', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date().toISOString(), rating: null });

reports.push({ id: generateId(), studentId: 'STU12345', location: 'Lecture Room L101', issueType: 'A/C Too High', comment: '', status: 'Fixed', createdAt: new Date(Date.now() - 172800000).toISOString(), rating: null });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});