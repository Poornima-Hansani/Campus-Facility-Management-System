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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ============= MONGOOSE SCHEMAS =============

// Report Schema
const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  location: { type: String, required: true },
  issueType: { type: String, required: true },
  comment: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: String, required: true },
  rating: { type: Number, default: null },
  image: { type: String, default: null },
  assignedTo: { type: String, default: null },
  assignedToId: { type: String, default: null },
  assignedAt: { type: String, default: null },
  fixedAt: { type: String, default: null },
  updatedAt: { type: String, default: null },
  awaitingApproval: { type: Boolean, default: false },
  staffNote: { type: String, default: '' },
  noteUpdatedAt: { type: String, default: null },
  approvedAt: { type: String, default: null }
}, { collection: 'reports' });

const Report = mongoose.model('Report', reportSchema);

// Registered Staff Schema
const registeredStaffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  specialty: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  registeredAt: { type: String, required: true }
}, { collection: 'registered_staff' });

const RegisteredStaff = mongoose.model('RegisteredStaff', registeredStaffSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  recipientType: { type: String, required: true }, // 'staff', 'management', 'student'
  recipientId: { type: String, required: true },
  message: { type: String, required: true },
  reportId: { type: String, default: null },
  location: { type: String, default: null },
  issueType: { type: String, default: null },
  staffName: { type: String, default: null },
  studentId: { type: String, default: null },
  createdAt: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { collection: 'notifications' });

const Notification = mongoose.model('Notification', notificationSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Predefined staff (for demo)
const staffMembers = [
  { id: 'STF001', name: 'Kamal Perera', role: 'Electrician', specialty: 'A/C & Electronics', phone: '+94 71 234 5678', email: 'kamal@university.edu' },
  { id: 'STF002', name: 'Sunil Fernando', role: 'Plumber', specialty: 'Water & Drainage', phone: '+94 71 345 6789', email: 'sunil@university.edu' },
  { id: 'STF003', name: 'Nimal Silva', role: 'Cleaner', specialty: 'Hygiene & Sanitation', phone: '+94 71 456 7890', email: 'nimal@university.edu' },
  { id: 'STF004', name: 'Ranjith Jayawardena', role: 'Technician', specialty: 'General Repairs', phone: '+94 71 567 8901', email: 'ranjith@university.edu' },
  { id: 'STF005', name: 'Priya Kumari', role: 'Supervisor', specialty: 'All Rounder', phone: '+94 71 678 9012', email: 'priya@university.edu' }
];

const staffCredentials = {
  'STF001': 'kamal123',
  'STF002': 'sunil123',
  'STF003': 'nimal123',
  'STF004': 'ranjith123',
  'STF005': 'priya123'
};

// Helper ID logic
const generateId = () => Math.random().toString(36).substr(2, 9);

// ============= REPORT ENDPOINTS =============

// POST /api/reports - Submit a new issue
app.post('/api/reports', upload.single('image'), async (req, res) => {
  try {
    console.log('Received POST /api/reports');
    
    const { location, issueType, comment, studentId } = req.body;
    
    if (!location || !issueType) {
      return res.status(400).json({ error: 'Location and Issue Type are required' });
    }

    const existingReport = await Report.findOne({
      studentId: studentId || 'STU12345',
      location,
      issueType,
      status: { $ne: 'Fixed' }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this issue at this location' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newReport = new Report({
      id: generateId(),
      studentId: studentId || 'STU12345',
      location,
      issueType,
      comment: comment || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      rating: null,
      image: imageUrl
    });

    await newReport.save();
    console.log('Report created:', newReport.id);

    // Escalate Logic: If 5 or more 'Pending' reports for same location & issueType -> change to 'Action Required'
    const matchingReports = await Report.find({ location, issueType, status: 'Pending' });
    
    if (matchingReports.length >= 5) {
      await Report.updateMany(
        { location, issueType, status: 'Pending' },
        { $set: { status: 'Action Required', updatedAt: new Date().toISOString() } }
      );
    }

    res.status(201).json({ message: 'Success', report: newReport });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET /api/reports - Get student's report history
app.get('/api/reports', async (req, res) => {
  try {
    const { studentId } = req.query;
    const studentReports = await Report.find({ studentId }).sort({ createdAt: -1 });
    res.json({ reports: studentReports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/reports/:id/rate - Submit rating for a fixed issue
app.post('/api/reports/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const report = await Report.findOne({ id });
    if (!report) return res.status(404).json({ error: 'Not found' });
    if (report.status !== 'Fixed') return res.status(400).json({ error: 'Can only rate fixed issues.' });
    if (report.rating) return res.status(400).json({ error: 'Already rated.' });

    report.rating = rating;
    await report.save();
    res.json({ message: 'Rating submitted.' });
  } catch (error) {
    console.error('Error rating report:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// ============= MANAGEMENT ENDPOINTS =============

// GET /api/management/dashboard - Get management dashboard data
app.get('/api/management/dashboard', async (req, res) => {
  try {
    const allReports = await Report.find({});
    const totalReports = allReports.length;
    const fixedReports = allReports.filter(r => r.status === 'Fixed').length;
    
    const ratedReports = allReports.filter(r => r.rating !== null);
    const avgRating = ratedReports.length 
      ? (ratedReports.reduce((sum, r) => sum + r.rating, 0) / ratedReports.length) 
      : 0;

    const avgResponseTime = (() => {
      const fixedWithTime = allReports.filter(r => r.status === 'Fixed' && r.fixedAt);
      if (fixedWithTime.length === 0) return 0;
      const totalMs = fixedWithTime.reduce((sum, r) => sum + (new Date(r.fixedAt) - new Date(r.createdAt)), 0);
      const avgMs = totalMs / fixedWithTime.length;
      const avgMinutes = Math.round(avgMs / (1000 * 60));
      return Math.min(Math.max(avgMinutes, 15), 180);
    })();

    // Group escalations
    const groupMap = {};
    allReports.forEach(r => {
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

    const pending = allReports.filter(r => r.status === 'Pending');
    const assigned = allReports.filter(r => r.status === 'Assigned' || r.status === 'In Progress');
    
    const locationMap = {};
    allReports.forEach(r => {
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
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// POST /api/management/fix - Mark assigned issues as fixed
app.post('/api/management/fix', async (req, res) => {
  try {
    const { ids } = req.body;
    
    await Report.updateMany(
      { id: { $in: ids }, status: 'Assigned' },
      { $set: { status: 'Fixed', fixedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
    );
    
    res.json({ message: 'Marked as fixed' });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ error: 'Failed to mark as fixed' });
  }
});

// GET /api/management/staff - Get all staff members
app.get('/api/management/staff', async (req, res) => {
  try {
    const registeredFromDb = await RegisteredStaff.find({});
    const allStaff = [...staffMembers, ...registeredFromDb.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      specialty: s.specialty,
      phone: s.phone,
      email: s.email
    }))];
    res.json({ staff: allStaff });
  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/management/assign - Assign staff to issues
app.post('/api/management/assign', async (req, res) => {
  try {
    const { ids, staffId } = req.body;
    
    let staff = staffMembers.find(s => s.id === staffId);
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      return res.status(400).json({ error: 'Invalid staff member' });
    }
    
    // Update reports
    await Report.updateMany(
      { id: { $in: ids } },
      { 
        $set: { 
          assignedTo: staff.name,
          assignedToId: staff.id,
          assignedAt: new Date().toISOString(),
          status: 'Assigned',
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Create notification for staff
    for (const id of ids) {
      const report = await Report.findOne({ id });
      if (report) {
        const notification = new Notification({
          type: 'staff_assigned',
          recipientType: 'staff',
          recipientId: staff.id,
          message: `You have been assigned: ${report.issueType} at ${report.location}`,
          reportId: report.id,
          location: report.location,
          issueType: report.issueType,
          createdAt: new Date().toISOString(),
          read: false
        });
        await notification.save();
      }
    }
    
    res.json({ message: 'Staff assigned successfully', assignedTo: staff.name });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Failed to assign staff' });
  }
});

// POST /api/management/approve-fix - Management approves fix and notifies student
app.post('/api/management/approve-fix', async (req, res) => {
  try {
    const { reportId } = req.body;
    
    const report = await Report.findOne({ id: reportId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    report.awaitingApproval = false;
    report.approvedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    await report.save();
    
    // Notify student
    const notification = new Notification({
      type: 'student_fixed',
      recipientType: 'student',
      recipientId: report.studentId,
      message: `Your issue has been fixed: ${report.issueType} at ${report.location}`,
      reportId: report.id,
      staffName: report.assignedTo,
      createdAt: new Date().toISOString(),
      read: false
    });
    await notification.save();
    
    res.json({ message: 'Fix approved and student notified', task: report });
  } catch (error) {
    console.error('Approve fix error:', error);
    res.status(500).json({ error: 'Failed to approve fix' });
  }
});

// GET /api/management/charts - Get chart data
app.get('/api/management/charts', async (req, res) => {
  try {
    const allReports = await Report.find({});
    
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

    allReports.forEach(r => {
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
  } catch (error) {
    console.error('Charts error:', error);
    res.status(500).json({ error: 'Failed to fetch charts data' });
  }
});

// GET /api/management/weekly-summary - Get weekly performance summary
app.get('/api/management/weekly-summary', async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyReports = await Report.find({ createdAt: { $gte: weekAgo.toISOString() } });
    const weeklyFixed = weeklyReports.filter(r => r.status === 'Fixed' && r.fixedAt && new Date(r.fixedAt) >= weekAgo);
    
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
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

// ============= STAFF API ENDPOINTS =============

// POST /api/staff/register - Register new staff
app.post('/api/staff/register', async (req, res) => {
  try {
    const { name, role, specialty, phone, email, password, confirmPassword } = req.body;
    
    if (!name || !role || !phone || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check phone in predefined staff
    const existingPhonePredefined = staffMembers.find(s => s.phone === phone);
    if (existingPhonePredefined) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Check phone in database
    const existingPhoneDb = await RegisteredStaff.findOne({ phone });
    if (existingPhoneDb) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Generate staff ID
    const count = await RegisteredStaff.countDocuments();
    const staffId = `STF${String(count + staffMembers.length + 1).padStart(3, '0')}`;
    
    const newStaff = new RegisteredStaff({
      id: staffId,
      name,
      role,
      specialty: specialty || role,
      phone,
      email,
      password,
      registeredAt: new Date().toISOString()
    });
    
    await newStaff.save();
    
    console.log('New staff registered:', staffId, name);
    
    res.status(201).json({ 
      message: 'Registration successful',
      staff: {
        id: staffId,
        name,
        role,
        specialty: specialty || role,
        phone,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// POST /api/staff/login - Staff login
app.post('/api/staff/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Staff ID/Email and password are required' });
    }
    
    let foundStaff = null;
    
    // Check predefined staff
    const predefinedStaff = staffMembers.find(s => s.id === identifier);
    if (predefinedStaff) {
      foundStaff = predefinedStaff;
      if (staffCredentials[foundStaff.id] !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      return res.json({
        message: 'Login successful',
        staff: {
          id: foundStaff.id,
          name: foundStaff.name,
          role: foundStaff.role,
          specialty: foundStaff.specialty,
          phone: foundStaff.phone,
          email: foundStaff.email
        }
      });
    }
    
    // Check registered staff by ID
    const registeredById = await RegisteredStaff.findOne({ id: identifier });
    if (registeredById) {
      if (registeredById.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      return res.json({
        message: 'Login successful',
        staff: {
          id: registeredById.id,
          name: registeredById.name,
          role: registeredById.role,
          specialty: registeredById.specialty,
          phone: registeredById.phone,
          email: registeredById.email
        }
      });
    }
    
    // Check registered staff by Email
    const registeredByEmail = await RegisteredStaff.findOne({ email: identifier });
    if (registeredByEmail) {
      if (registeredByEmail.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      return res.json({
        message: 'Login successful',
        staff: {
          id: registeredByEmail.id,
          name: registeredByEmail.name,
          role: registeredByEmail.role,
          specialty: registeredByEmail.specialty,
          phone: registeredByEmail.phone,
          email: registeredByEmail.email
        }
      });
    }
    
    return res.status(401).json({ error: 'Invalid Staff ID or Email' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/staff/profile - Get staff profile
app.get('/api/staff/profile', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const staffReports = await Report.find({ assignedTo: staff.name });
    const completed = staffReports.filter(r => r.status === 'Fixed');
    const inProgress = staffReports.filter(r => r.status === 'In Progress');
    const pending = staffReports.filter(r => r.status === 'Assigned');
    
    const ratings = completed.filter(r => r.rating).map(r => r.rating);
    const avgRating = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10 
      : null;
    
    res.json({
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        specialty: staff.specialty,
        phone: staff.phone,
        email: staff.email
      },
      stats: {
        totalAssigned: staffReports.length,
        pending: pending.length,
        inProgress: inProgress.length,
        completed: completed.length,
        avgRating
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/staff/tasks - Get tasks assigned to staff
app.get('/api/staff/tasks', async (req, res) => {
  try {
    const { staffId, filter } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    let staffReports = await Report.find({ assignedTo: staff.name });
    
    if (filter === 'pending') {
      staffReports = staffReports.filter(r => r.status === 'Assigned');
    } else if (filter === 'inProgress') {
      staffReports = staffReports.filter(r => r.status === 'In Progress');
    } else if (filter === 'completed') {
      staffReports = staffReports.filter(r => r.status === 'Fixed');
    }
    
    staffReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ tasks: staffReports });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PUT /api/staff/tasks/:id/status - Update task status
app.put('/api/staff/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Assigned', 'In Progress', 'Fixed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const report = await Report.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (report.status === 'Fixed' && status !== 'Fixed') {
      return res.status(400).json({ error: 'Cannot revert a fixed task' });
    }
    
    report.status = status;
    report.updatedAt = new Date().toISOString();
    
    if (status === 'Fixed') {
      report.fixedAt = new Date().toISOString();
      report.awaitingApproval = true;
      
      // Notify management
      const notification = new Notification({
        type: 'management_fix_complete',
        recipientType: 'management',
        recipientId: 'management',
        message: `${report.assignedTo} has fixed: ${report.issueType} at ${report.location}`,
        reportId: report.id,
        staffName: report.assignedTo,
        location: report.location,
        issueType: report.issueType,
        studentId: report.studentId,
        createdAt: new Date().toISOString(),
        read: false
      });
      await notification.save();
    }
    
    await report.save();
    res.json({ message: 'Status updated', task: report });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PUT /api/staff/tasks/:id/note - Add note to task
app.put('/api/staff/tasks/:id/note', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const report = await Report.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    report.staffNote = note;
    report.noteUpdatedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    await report.save();
    
    res.json({ message: 'Note updated', task: report });
  } catch (error) {
    console.error('Note update error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// GET /api/staff/feedback - Get feedback for staff
app.get('/api/staff/feedback', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const feedback = await Report.find({ 
      assignedTo: staff.name, 
      status: 'Fixed',
      rating: { $ne: null }
    });
    
    feedback.sort((a, b) => new Date(b.fixedAt) - new Date(a.fixedAt));
    
    res.json({ feedback: feedback.map(r => ({
      id: r.id,
      location: r.location,
      issueType: r.issueType,
      rating: r.rating,
      staffNote: r.staffNote,
      fixedAt: r.fixedAt,
      studentId: r.studentId
    }))});
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ============= NOTIFICATION ENDPOINTS =============

// GET /api/notifications/staff
app.get('/api/notifications/staff', async (req, res) => {
  try {
    const { staffId } = req.query;
    const notifications = await Notification.find({ 
      recipientType: 'staff', 
      recipientId: staffId 
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/staff/:id/read
app.put('/api/notifications/staff/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.updateOne({ _id: id }, { $set: { read: true } });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// GET /api/notifications/management
app.get('/api/notifications/management', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipientType: 'management' 
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/student
app.get('/api/notifications/student', async (req, res) => {
  try {
    const { studentId } = req.query;
    const notifications = await Notification.find({ 
      recipientType: 'student', 
      recipientId: studentId 
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
