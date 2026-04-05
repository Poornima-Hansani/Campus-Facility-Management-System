const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require("dotenv").config();

const app = express();
const PORT = 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log(err));

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// In-memory data store for the presentation demo
let reports = [];

const staffMembers = [
  { id: 'STF001', name: 'Kamal Perera', role: 'Electrician', specialty: 'A/C & Electronics' },
  { id: 'STF002', name: 'Sunil Fernando', role: 'Plumber', specialty: 'Water & Drainage' },
  { id: 'STF003', name: 'Nimal Silva', role: 'Cleaner', specialty: 'Hygiene & Sanitation' },
  { id: 'STF004', name: 'Ranjith Jayawardena', role: 'Technician', specialty: 'General Repairs' },
  { id: 'STF005', name: 'Priya Kumari', role: 'Supervisor', specialty: 'All Rounder' }
];

// Helper ID logic
const generateId = () => Math.random().toString(36).substr(2, 9);

// POST /api/reports - Submit a new issue
app.post('/api/reports', upload.single('image'), (req, res) => {
  console.log('Received POST /api/reports');
  console.log('Body:', req.body);
  console.log('File:', req.file ? req.file.filename : 'No file');
  
  const { location, issueType, comment, studentId } = req.body;
  
  if (!location || !issueType) {
    return res.status(400).json({ error: 'Location and Issue Type are required' });
  }

  // Prevent immediate duplicates from the same student for the exact same issue and location not fixed yet
  const isDuplicate = reports.some(r => r.studentId === studentId && r.location === location && r.issueType === issueType && r.status !== 'Fixed');
  if (isDuplicate) {
    return res.status(400).json({ error: 'You have already reported this issue.' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newReport = {
    id: generateId(),
    studentId: studentId || 'STU12345',
    location,
    issueType,
    comment: comment || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    rating: null,
    image: imageUrl
  };

  reports.push(newReport);
  console.log('Report created:', newReport.id);

  // Escalate Logic: If 5 or more 'Pending' reports for same location & issueType -> change to 'Action Required'
  const matchingReports = reports.filter(r => r.location === location && r.issueType === issueType && r.status === 'Pending');
  
  if (matchingReports.length >= 5) {
    matchingReports.forEach(r => {
      r.status = 'Action Required';
      r.updatedAt = new Date().toISOString();
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

// GET /api/reports/count - Count matching reports for escalation hint
app.get('/api/reports/count', (req, res) => {
  const { location, issueType } = req.query;
  if (!location || !issueType) {
    return res.json({ count: 0 });
  }
  const matchingReports = reports.filter(r => 
    r.location === location && 
    r.issueType === issueType && 
    r.status !== 'Fixed'
  );
  res.json({ count: matchingReports.length });
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

  const avgResponseTime = (() => {
    const fixedWithTime = reports.filter(r => r.status === 'Fixed' && r.fixedAt);
    if (fixedWithTime.length === 0) return 0;
    const totalMs = fixedWithTime.reduce((sum, r) => sum + (new Date(r.fixedAt) - new Date(r.createdAt)), 0);
    const avgMs = totalMs / fixedWithTime.length;
    const avgMinutes = Math.round(avgMs / (1000 * 60));
    return Math.min(Math.max(avgMinutes, 15), 180);
  })();

  // Group escalations (Pending or Action Required)
  const groupMap = {};
  reports.forEach(r => {
    if (r.status === 'Fixed') return;
    const key = `${r.location}|${r.issueType}`;
    if (!groupMap[key]) {
      groupMap[key] = { location: r.location, issueType: r.issueType, count: 0, status: r.status, ids: [], missingStaff: false };
    }
    groupMap[key].count += 1;
    groupMap[key].ids.push(r.id);
    if (r.status === 'Action Required') groupMap[key].status = 'Action Required';
  });

  const escalated = Object.values(groupMap)
    .filter(g => g.count >= 5 || g.status === 'Action Required')
    .map(g => ({
      ...g,
      missingStaff: g.count >= 5
    }));

  const pending = reports.filter(r => r.status === 'Pending');
  const assigned = reports.filter(r => r.status === 'Assigned');
  
  console.log('=== DASHBOARD ===');
  console.log('Pending:', pending.length);
  console.log('Assigned:', assigned.length);
  console.log('Assigned reports:', assigned.map(r => ({ id: r.id, status: r.status, assignedTo: r.assignedTo })));
  console.log('=== END DASHBOARD ===');

  const locationMap = {};
  reports.forEach(r => {
    if (!locationMap[r.location]) {
      locationMap[r.location] = 0;
    }
    locationMap[r.location]++;
  });
  const topLocations = Object.entries(locationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  res.json({
    stats: { totalReports, fixedReports, avgRating, avgResponseTime },
    escalated,
    pending,
    assigned,
    topLocations
  });
});

// POST /api/management/fix - Mark assigned issues as fixed
app.post('/api/management/fix', (req, res) => {
  const { ids } = req.body;
  
  ids.forEach(id => {
    const report = reports.find(r => r.id === id);
    if (report && report.status === 'Assigned') {
      report.status = 'Fixed';
      report.fixedAt = new Date().toISOString();
      report.updatedAt = new Date().toISOString();
    }
  });

  res.json({ message: 'Marked as fixed' });
});

// GET /api/management/staff - Get available staff members
app.get('/api/management/staff', (req, res) => {
  res.json({ staff: staffMembers });
});

// POST /api/management/assign - Assign staff to issues
app.post('/api/management/assign', (req, res) => {
  const { ids, staffId } = req.body;
  console.log('=== ASSIGN REQUEST ===');
  console.log('IDs to assign:', ids);
  console.log('Staff ID:', staffId);
  
  const staff = staffMembers.find(s => s.id === staffId);
  if (!staff) {
    console.log('ERROR: Invalid staff member');
    return res.status(400).json({ error: 'Invalid staff member' });
  }
  
  console.log('Assigning to staff:', staff.name);
  
  ids.forEach(id => {
    const report = reports.find(r => r.id === id);
    console.log('Looking for id:', id, 'Found:', report ? 'YES' : 'NO');
    if (report) {
      console.log('Report status before:', report.status);
      report.assignedTo = staff.name;
      report.assignedAt = new Date().toISOString();
      report.status = 'Assigned';
      report.updatedAt = new Date().toISOString();
      console.log('Report status after:', report.status);
    }
  });

  const assignedCount = reports.filter(r => r.status === 'Assigned').length;
  console.log('Total assigned reports:', assignedCount);
  console.log('=== END ASSIGN ===');
  
  res.json({ message: 'Staff assigned successfully', assignedTo: staff.name });
});

// GET /api/management/charts - Get chart data
app.get('/api/management/charts', (req, res) => {
  const categoryMap = {
    'Lecture Rooms': 0,
    'Washrooms': 0,
    'Canteens': 0,
    'Other': 0
  };

  const weeklyTrend = {
    'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
  };

  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  reports.forEach(r => {
    const loc = r.location.toLowerCase();
    if (loc.includes('lecture') || loc.includes('room')) {
      categoryMap['Lecture Rooms']++;
    } else if (loc.includes('washroom') || loc.includes('toilet') || loc.includes('bathroom')) {
      categoryMap['Washrooms']++;
    } else if (loc.includes('canteen')) {
      categoryMap['Canteens']++;
    } else {
      categoryMap['Other']++;
    }

    const day = dayMap[new Date(r.createdAt).getDay()];
    weeklyTrend[day]++;
  });

  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  const weeklyData = Object.entries(weeklyTrend).map(([day, count]) => ({ day, count }));

  res.json({ categoryData, weeklyData });
});

// GET /api/management/weekly-summary - Get weekly performance summary
app.get('/api/management/weekly-summary', (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyReports = reports.filter(r => new Date(r.createdAt) >= weekAgo);
  const weeklyFixed = reports.filter(r => 
    r.status === 'Fixed' && r.fixedAt && new Date(r.fixedAt) >= weekAgo
  );
  
  const categoryMap = { 'Lecture Rooms': 0, 'Washrooms': 0, 'Canteens': 0 };
  weeklyReports.forEach(r => {
    const loc = r.location.toLowerCase();
    if (loc.includes('lecture') || loc.includes('room')) categoryMap['Lecture Rooms']++;
    else if (loc.includes('washroom')) categoryMap['Washrooms']++;
    else if (loc.includes('canteen')) categoryMap['Canteens']++;
  });
  
  const avgResponseTimeWeekly = weeklyFixed.length > 0
    ? Math.round(weeklyFixed.reduce((sum, r) => sum + (new Date(r.fixedAt) - new Date(r.createdAt)), 0) / weeklyFixed.length / (1000 * 60))
    : 45;

  const summary = {
    totalReports: weeklyReports.length,
    fixedReports: weeklyFixed.length,
    avgResponseTime: avgResponseTimeWeekly,
    categoryBreakdown: categoryMap,
    resolutionRate: weeklyReports.length > 0 ? Math.round((weeklyFixed.length / weeklyReports.length) * 100) : 0
  };

  res.json({ summary });
});

// GET /api/student/weekly-summary - Get weekly performance summary for students
app.get('/api/student/weekly-summary', (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyReports = reports.filter(r => new Date(r.createdAt) >= weekAgo);
  const weeklyFixed = reports.filter(r => 
    r.status === 'Fixed' && r.fixedAt && new Date(r.fixedAt) >= weekAgo
  );
  
  const staffStats = staffMembers.map(staff => {
    const staffFixed = weeklyFixed.filter(r => r.assignedTo === staff.id);
    const ratings = staffFixed.filter(r => r.rating).map(r => r.rating);
    const avgRating = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10 
      : null;
    
    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      fixedCount: staffFixed.length,
      avgRating
    };
  });
  
  staffStats.sort((a, b) => {
    if (b.avgRating !== a.avgRating) {
      if (b.avgRating === null) return -1;
      if (a.avgRating === null) return 1;
      return b.avgRating - a.avgRating;
    }
    return b.fixedCount - a.fixedCount;
  });
  
  res.json({ 
    topStaff: staffStats.slice(0, 3),
    totalFixed: weeklyFixed.length,
    totalReports: weeklyReports.length
  });
});

// Add some dummy initial data to show in presentation without 5 clicks
reports.push({ id: generateId(), studentId: 'OTHER_STU', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 86400000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU2', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 80000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU3', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 76000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU4', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 66000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU5', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date().toISOString(), rating: null });

reports.push({ id: generateId(), studentId: 'STU12345', location: 'Lecture Room L101', issueType: 'A/C Not Working', comment: '', status: 'Fixed', createdAt: new Date(Date.now() - 7200000).toISOString(), fixedAt: new Date(Date.now() - 3600000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'STU001', location: 'Library Washroom 2F', issueType: 'Water Leak', comment: '', status: 'Fixed', createdAt: new Date(Date.now() - 10800000).toISOString(), fixedAt: new Date(Date.now() - 5400000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'STU002', location: 'Block A Washroom (Gnd)', issueType: 'Cleanliness/Tidiness', comment: '', status: 'Fixed', createdAt: new Date(Date.now() - 14400000).toISOString(), fixedAt: new Date(Date.now() - 9000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'STU001', location: 'Lecture Room L102', issueType: 'Projector Issue', comment: '', status: 'Pending', createdAt: new Date(Date.now() - 1800000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'STU002', location: 'Main Canteen', issueType: 'Cleanliness/Tidiness', comment: '', status: 'Pending', createdAt: new Date(Date.now() - 2700000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'STU003', location: 'Engineering Canteen', issueType: 'Water Faucet Broken', comment: '', status: 'Pending', createdAt: new Date(Date.now() - 900000).toISOString(), rating: null });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});