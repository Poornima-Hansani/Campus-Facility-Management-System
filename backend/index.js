const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require('multer');
const fs = require('fs');

require("dotenv").config({ path: path.join(__dirname, ".env") });

const academicTaskRoutes = require("./routes/academicTaskRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const lectureReminderRoutes = require("./routes/lectureReminderRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const assignmentExamRoutes = require("./routes/assignmentExamRoutes");
const studyGoalRoutes = require("./routes/studyGoalRoutes");
const helpRequestRoutes = require("./routes/helpRequestRoutes");
const managementEmailRoutes = require("./routes/managementEmailRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const energyRoutes = require("./routes/energyRoutes");
const studentTimetableRoutes = require("./routes/studentTimeTableRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const locationRoutes = require("./routes/locationRoutes");
const labTimetableRoutes = require("./routes/labTimetableRoutes");
const labStudentCommonFreeRoutes = require("./routes/labStudentCommonFreeRoutes");
const labBookingRoutes = require("./routes/labBookingRoutes");
const labFreeGapRoutes = require("./routes/labFreeGapRoutes");
const studyAreaRoutes = require("./routes/studyAreaRoutes");
const managementRoutes = require("./routes/managementRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

const lectureNoteRoutes = require("./routes/lectureNoteRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const meetingRoutes = require("./routes/meetingRoutes");

const Reminder = require("./models/Reminder");
const AcademicTask = require("./models/AcademicTask");
const User = require("./models/User");
const { seedDatabase } = require("./seed/seedDatabase");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api/academic-tasks', academicTaskRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/lecture-reminders', lectureReminderRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments-exams', assignmentExamRoutes);
app.use('/api/study-goals', studyGoalRoutes);
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/management/emails', managementEmailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/studenttimetables', studentTimetableRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/labtimetable', labTimetableRoutes);
app.use('/api/lab-student-common-free', labStudentCommonFreeRoutes);
app.use('/api/lab-booking', labBookingRoutes);
app.use('/api/lab-gap', labFreeGapRoutes);
app.use('/api/study-areas', studyAreaRoutes);

app.use('/api/lecture-notes', lectureNoteRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/meetings', meetingRoutes);

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

const generateId = () => Math.random().toString(36).substr(2, 9);

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

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  recipientType: { type: String, required: true },
  recipientId: { type: String, required: true },
  message: { type: String, required: true },
  reportId: { type: String, default: null },
  location: { type: String, default: null },
  issueType: { type: String, default: null },
  staffName: { type: String, default: null },
  studentId: { type: String, default: null },
  moduleCode: { type: String, default: null },
  moduleName: { type: String, default: null },
  topic: { type: String, default: null },
  helpRequestId: { type: Number, default: null },
  reply: { type: String, default: null },
  createdAt: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { collection: 'notifications' });

// Reuse the model if it exists, otherwise create it
let Notification;
try {
  Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
} catch (e) {
  Notification = mongoose.model('Notification', notificationSchema);
}

app.use("/api/tasks", academicTaskRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/lecture-reminders", lectureReminderRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/assignments-exams", assignmentExamRoutes);
app.use("/api/study-goals", studyGoalRoutes);
app.use("/api/help-requests", helpRequestRoutes);
app.use("/api/management/emails", managementEmailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/student-timetable", studentTimetableRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/locations", locationRoutes);
app.post('/api/reports', upload.single('image'), async (req, res) => {
  try {
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

    const notification = new Notification({
      type: 'new_report',
      recipientType: 'management',
      recipientId: 'management',
      message: `New issue reported: ${issueType} at ${location}`,
      reportId: newReport.id,
      location: location,
      issueType: issueType,
      studentId: studentId || 'STU12345',
      createdAt: new Date().toISOString(),
      read: false
    });
    await notification.save();

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

app.get('/api/reports/count', async (req, res) => {
  try {
    const { location, issueType } = req.query;
    const count = await Report.countDocuments({ location, issueType, status: { $ne: 'Fixed' } });
    res.json({ count });
  } catch (err) {
    console.error('Count error:', err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

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
      const fixedWithTime = allReports.filter(r => r.status === 'Fixed ' && r.fixedAt);
      if (fixedWithTime.length === 0) return 0;
      const totalMs = fixedWithTime.reduce((sum, r) => sum + (new Date(r.fixedAt) - new Date(r.createdAt)), 0);
      const avgMs = totalMs / fixedWithTime.length;
      const avgMinutes = Math.round(avgMs / (1000 * 60));
      return Math.min(Math.max(avgMinutes, 15), 180);
    })();

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

app.get('/api/management/staff', async (req, res) => {
  try {
    const registeredFromDb = await RegisteredStaff.find({});
    const staffFromUsers = await User.find({ role: 'staff' });
    const staffFromUsersData = staffFromUsers.map(u => ({
      id: u.userId,
      name: u.name,
      role: u.jobType || u.role,
      specialty: u.jobType || u.role,
      phone: u.phone || '',
      email: u.email
    }));
    
    let allStaff = [
      ...staffMembers, 
      ...registeredFromDb.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        specialty: s.specialty,
        phone: s.phone,
        email: s.email
      })),
      ...staffFromUsersData
    ];
    
    const seen = new Set();
    allStaff = allStaff.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    
    const allReports = await Report.find({});
    
    allStaff = allStaff.map(staff => {
      const activeTasks = allReports.filter(r => 
        r.assignedToId === staff.id && 
        (r.status === 'Assigned' || r.status === 'In Progress')
      ).length;
      
      let workloadStatus = 'Free';
      if (activeTasks >= 5) workloadStatus = 'Busy';
      else if (activeTasks >= 3) workloadStatus = 'Medium';
      
      return {
        ...staff,
        activeTasks,
        workloadStatus
      };
    });

    allStaff.sort((a, b) => a.activeTasks - b.activeTasks);
    
    res.json({ staff: allStaff });
  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/management/assign', async (req, res) => {
  try {
    const { ids, staffId } = req.body;
    
    let staff = staffMembers.find(s => s.id === staffId);
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    if (!staff) {
      const userStaff = await User.findOne({ userId: staffId, role: 'staff' });
      if (userStaff) {
        staff = {
          id: userStaff.userId,
          name: userStaff.name,
          role: userStaff.jobType || userStaff.role
        };
      }
    }
    
    if (!staff) {
      return res.status(400).json({ error: 'Invalid staff member' });
    }
    
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
    
    await Notification.updateMany(
      { reportId: reportId, type: 'management_fix_complete' },
      { read: true }
    );
    
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

    res.json({ message: 'Fixed approved' });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Failed to approve fix' });
  }
});

app.get('/api/management/weekly-summary', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const allReports = await Report.find({});
    const reportsLastWeek = allReports.filter(r => new Date(r.createdAt) >= sevenDaysAgo);
    const fixedLastWeek = reportsLastWeek.filter(r => r.status === 'Fixed');
    
    let totalResponseTime = 0;
    let count = 0;
    fixedLastWeek.forEach(r => {
      if (r.fixedAt) {
        totalResponseTime += (new Date(r.fixedAt) - new Date(r.createdAt)) / (1000 * 60);
        count++;
      }
    });
    const avgResponseTime = count > 0 ? Math.round(totalResponseTime / count) : 0;
    const resolutionRate = reportsLastWeek.length > 0 
      ? Math.round((fixedLastWeek.length / reportsLastWeek.length) * 100) 
      : 0;
    
    res.json({
      summary: {
        totalReports: reportsLastWeek.length,
        fixedReports: fixedLastWeek.length,
        avgResponseTime,
        resolutionRate
      }
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

app.get('/api/management/charts', async (req, res) => {
  try {
    const allReports = await Report.find({});
    
    const locationCounts = {};
    allReports.forEach(r => {
      if (!locationCounts[r.location]) {
        locationCounts[r.location] = 0;
      }
      locationCounts[r.location]++;
    });
    
    const issueTypeCounts = {};
    allReports.forEach(r => {
      if (!issueTypeCounts[r.issueType]) {
        issueTypeCounts[r.issueType] = 0;
      }
      issueTypeCounts[r.issueType]++;
    });
    
    const statusCounts = {
      Pending: allReports.filter(r => r.status === 'Pending').length,
      Assigned: allReports.filter(r => r.status === 'Assigned').length,
      'In Progress': allReports.filter(r => r.status === 'In Progress').length,
      Fixed: allReports.filter(r => r.status === 'Fixed').length,
      'Action Required': allReports.filter(r => r.status === 'Action Required').length
    };
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = allReports.filter(r => r.createdAt.startsWith(dateStr)).length;
      last7Days.push({ date: dateStr, count });
    }
    
    res.json({
      byLocation: Object.entries(locationCounts).map(([location, count]) => ({ location, count })),
      byIssueType: Object.entries(issueTypeCounts).map(([issueType, count]) => ({ issueType, count })),
      byStatus: statusCounts,
      weeklyTrend: last7Days
    });
  } catch (error) {
    console.error('Charts error:', error);
    res.status(500).json({ error: 'Failed to fetch charts data' });
  }
});

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
    
    const existingPhonePredefined = staffMembers.find(s => s.phone === phone);
    if (existingPhonePredefined) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    const existingPhoneDb = await RegisteredStaff.findOne({ phone });
    if (existingPhoneDb) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
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

app.post('/api/staff/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Staff ID/Email and password are required' });
    }
    
    let foundStaff = null;
    
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

app.get('/api/staff/profile', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    let staffSource = 'hardcoded';
    
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
      staffSource = 'registered';
    }
    
    if (!staff) {
      const userStaff = await User.findOne({ userId: staffId, role: 'staff' });
      if (userStaff) {
        staff = {
          id: userStaff.userId,
          name: userStaff.name,
          role: userStaff.role,
          specialty: userStaff.jobType || userStaff.role,
          phone: userStaff.phone || '',
          email: userStaff.email
        };
        staffSource = 'user';
      }
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
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10 
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

app.get('/api/staff/tasks', async (req, res) => {
  try {
    const { staffId, filter } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      const userStaff = await User.findOne({ userId: staffId, role: 'staff' });
      if (userStaff) {
        staff = {
          id: userStaff.userId,
          name: userStaff.name,
          role: userStaff.role,
          specialty: userStaff.jobType || userStaff.role,
          phone: userStaff.phone || '',
          email: userStaff.email
        };
      }
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
      
      // Also notify the student about the fix
      const studentNotification = new Notification({
        type: 'student_fixed',
        recipientType: 'student',
        recipientId: report.studentId,
        message: `Your issue has been fixed: ${report.issueType} at ${report.location}`,
        reportId: report.id,
        location: report.location,
        issueType: report.issueType,
        staffName: report.assignedTo,
        studentId: report.studentId,
        createdAt: new Date().toISOString(),
        read: false
      });
      await studentNotification.save();
    } else if (status === 'In Progress') {
      // Notify student that staff is working on it
      const studentNotification = new Notification({
        type: 'student_in_progress',
        recipientType: 'student',
        recipientId: report.studentId,
        message: `${report.assignedTo} is now working on: ${report.issueType} at ${report.location}`,
        reportId: report.id,
        location: report.location,
        issueType: report.issueType,
        staffName: report.assignedTo,
        studentId: report.studentId,
        createdAt: new Date().toISOString(),
        read: false
      });
      await studentNotification.save();
    }
    
    await report.save();
    res.json({ message: 'Status updated', task: report });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

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

app.get('/api/staff/feedback', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = await RegisteredStaff.findOne({ id: staffId });
    }
    
    if (!staff) {
      const userStaff = await User.findOne({ userId: staffId, role: 'staff' });
      if (userStaff) {
        staff = {
          id: userStaff.userId,
          name: userStaff.name,
          role: userStaff.role,
          specialty: userStaff.jobType || userStaff.role,
          phone: userStaff.phone || '',
          email: userStaff.email
        };
      }
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

// UNIFIED NOTIFICATIONS ENDPOINT - Gets all notifications for a student
// Includes: timetable notifications, general notifications, bookings, help requests, issue reports
app.get('/api/campus-notifications', async (req, res) => {
  try {
    const { studentId, specialization } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    const allNotifications = [];
    
    // 1. Timetable Notifications (filtered by specialization)
    try {
      const TimetableNotification = require('./models/TimetableNotification');
      const timetableNotifs = await TimetableNotification.find({
        $or: [
          { specialization: specialization || '' },
          { specialization: { $exists: false } },
          { specialization: null },
          { specialization: '' }
        ]
      }).sort({ createdAt: -1 }).limit(50).lean();
      
      timetableNotifs.forEach(n => {
        allNotifications.push({
          _id: `tt_${n._id}`,
          type: 'timetable',
          title: n.title || n.moduleName || 'Timetable Update',
          message: n.message || `${n.type}: ${n.moduleCode || ''} - ${n.venueName || ''} at ${n.time || ''}`,
          category: 'timetable',
          createdAt: n.createdAt,
          readBy: n.readBy || [],
          data: n
        });
      });
    } catch (e) {
      console.error('Error fetching timetable notifications:', e);
    }
    
    // 2. General Notifications for the student
    try {
      const studentNotifs = await Notification.find({ 
        recipientType: 'student', 
        recipientId: studentId 
      }).sort({ createdAt: -1 }).limit(50).lean();
      
      studentNotifs.forEach(n => {
        let category = 'general';
        let title = n.message;
        
        if (n.type === 'student_fixed') {
          category = 'issue';
          title = 'Issue Fixed';
        } else if (n.type === 'new_report') {
          category = 'issue';
          title = 'Issue Update';
        }
        
        allNotifications.push({
          _id: `notif_${n._id}`,
          type: 'notification',
          title,
          message: n.message,
          category,
          issueType: n.issueType,
          location: n.location,
          reportId: n.reportId,
          createdAt: n.createdAt,
          read: n.read,
          data: n
        });
      });
    } catch (e) {
      console.error('Error fetching student notifications:', e);
    }
    
    // 3. Help Request Notifications
    try {
      const HelpRequest = require('./models/HelpRequest');
      const helpRequests = await HelpRequest.find({
        studentName: { $regex: new RegExp(studentId.replace(/[STU0-9]/gi, '').split(' ')[0] || '.', 'i') }
      }).sort({ updatedAt: -1 }).limit(20).lean();
      
      // Also check by numeric ID patterns
      const helpRequestsById = await HelpRequest.find({}).sort({ numericId: -1 }).limit(50).lean();
      
      // Filter help requests that have status updates (Scheduled or Completed) for this student
      helpRequestsById.forEach(req => {
        // Create notification for scheduled/completed help requests
        if (req.status === 'Scheduled') {
          allNotifications.push({
            _id: `help_${req._id}`,
            type: 'help_request',
            title: 'Help Request Scheduled',
            message: `Your help request for ${req.moduleCode} - ${req.topic} has been scheduled`,
            category: 'help',
            moduleCode: req.moduleCode,
            moduleName: req.moduleName,
            status: req.status,
            createdAt: req.updatedAt || req.createdAt,
            read: false,
            data: req
          });
        } else if (req.status === 'Completed') {
          allNotifications.push({
            _id: `help_${req._id}`,
            type: 'help_request',
            title: 'Help Request Completed',
            message: `Your help request for ${req.moduleCode} - ${req.topic} has been completed`,
            category: 'help',
            moduleCode: req.moduleCode,
            moduleName: req.moduleName,
            status: req.status,
            createdAt: req.updatedAt || req.createdAt,
            read: false,
            data: req
          });
        }
      });
    } catch (e) {
      console.error('Error fetching help requests:', e);
    }
    
    // 4. Issue Report Notifications for this student
    try {
      const reports = await Report.find({ studentId: studentId }).sort({ createdAt: -1 }).limit(20).lean();
      
      reports.forEach(report => {
        let title = 'Issue Update';
        let message = report.comment || `${report.issueType} at ${report.location}`;
        
        if (report.status === 'Assigned' && report.assignedTo) {
          title = 'Staff Assigned';
          message = `${report.assignedTo} has been assigned to fix: ${report.issueType} at ${report.location}`;
        } else if (report.status === 'In Progress') {
          title = 'Issue Being Fixed';
          message = `${report.issueType} at ${report.location} is being worked on`;
        } else if (report.status === 'Fixed') {
          title = 'Issue Fixed';
          message = `${report.issueType} at ${report.location} has been fixed`;
        }
        
        allNotifications.push({
          _id: `report_${report._id}`,
          type: 'issue_report',
          title,
          message,
          category: 'issue',
          status: report.status,
          location: report.location,
          issueType: report.issueType,
          createdAt: report.updatedAt || report.createdAt,
          read: report.status === 'Fixed',
          data: report
        });
      });
    } catch (e) {
      console.error('Error fetching reports:', e);
    }
    
    // 5. Booking Notifications
    try {
      const StudyAreaBooking = require('./models/StudyAreaBooking');
      const bookings = await StudyAreaBooking.find({ user: studentId })
        .populate('studyArea', 'name location')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      bookings.forEach(booking => {
        const areaName = booking.studyArea?.name || 'Study Area';
        const areaLocation = booking.studyArea?.location || '';
        
        if (booking.status === 'confirmed') {
          allNotifications.push({
            _id: `booking_${booking._id}`,
            type: 'booking',
            title: 'Booking Confirmed',
            message: `Your booking for ${areaName} on ${new Date(booking.date).toLocaleDateString()} (${booking.startTime} - ${booking.endTime}) is confirmed`,
            category: 'booking',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            areaName,
            areaLocation,
            createdAt: booking.createdAt,
            read: false,
            data: booking
          });
        } else if (booking.status === 'cancelled') {
          allNotifications.push({
            _id: `booking_${booking._id}`,
            type: 'booking',
            title: 'Booking Cancelled',
            message: `Your booking for ${areaName} on ${new Date(booking.date).toLocaleDateString()} has been cancelled`,
            category: 'booking',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            areaName,
            areaLocation,
            createdAt: booking.updatedAt || booking.createdAt,
            read: false,
            data: booking
          });
        }
      });
    } catch (e) {
      console.error('Error fetching bookings:', e);
    }
    
    // Sort all notifications by createdAt descending
    allNotifications.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    // Remove duplicates based on type and data
    const seen = new Set();
    const uniqueNotifications = allNotifications.filter(n => {
      const key = `${n.type}_${n._id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    res.json({ 
      notifications: uniqueNotifications.slice(0, 50),
      total: uniqueNotifications.length
    });
    
  } catch (error) {
    console.error('Campus notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch campus notifications' });
  }
});

app.get("/", (req, res) => {
  res.json({
    name: "UniManage API",
    version: "1.0.0",
    routes: [
      "/api/lectures",
      "/api/lecture-reminders",
      "/api/timetable",
      "/api/assignments-exams",
      "/api/study-goals",
      "/api/help-requests",
      "/api/management/emails",
      "/api/tasks",
      "/api/reports",
      "/api/management",
      "/api/staff",
      "/api/notifications",
      "/api/energy"
    ],
  });
});

function startReminderJob() {
  setInterval(async () => {
    try {
      const now = new Date();

      const reminders = await Reminder.find({
        remindAt: { $lte: now },
        isSent: false,
      });

      for (const reminder of reminders) {
        console.log("Reminder:", reminder.title);
        reminder.isSent = true;
        await reminder.save();
      }

      const overdueTasks = await AcademicTask.find({
        dueDateTime: { $lt: now },
        status: "pending",
      });

      for (const task of overdueTasks) {
        task.status = "missed";
        await task.save();
      }
    } catch (error) {
      console.log("Reminder checker error:", error.message);
    }
  }, 60000);
}

function startEnergyCheckJob() {
  setInterval(async () => {
    try {
      const LabFreeTime = require('./models/LabFreeTime');
      const EnergyNotification = require('./models/EnergyNotification');
      
      const today = new Date().toISOString().split('T')[0];
      
      const pendingNotifications = await EnergyNotification.find({
        status: 'pending',
        date: { $lt: today }
      });

      for (const notification of pendingNotifications) {
        notification.status = 'expired';
        await notification.save();
        
        if (notification.freeTimeId) {
          await LabFreeTime.findByIdAndUpdate(notification.freeTimeId, {
            isEnergyWaste: true
          });
        }
      }
      
      if (pendingNotifications.length > 0) {
        console.log(`Energy check: ${pendingNotifications.length} notifications marked as expired`);
      }
    } catch (error) {
      console.log('Energy check job error:', error.message);
    }
  }, 3600000);
}


let mongoWasConnected = false;
mongoose.connection.on("connected", () => {
  mongoWasConnected = true;
});
mongoose.connection.on("disconnected", () => {
  if (mongoWasConnected) {
    console.warn("MongoDB disconnected.");
  }
});
mongoose.connection.on("error", (err) => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  console.error("MongoDB runtime error:", err.message);
});

let MONGO_URI = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/unimanage";

if (!MONGO_URI) {
  MONGO_URI = DEFAULT_LOCAL_URI;
  console.warn(`MONGO_URI not set; using default local database: ${DEFAULT_LOCAL_URI}`);
}

if (
  MONGO_URI.includes("your-cluster-host") ||
  MONGO_URI.includes("YOUR_CLUSTER")
) {
  console.warn("MONGO_URI looks like a placeholder Atlas host. Using local MongoDB instead.");
  MONGO_URI = DEFAULT_LOCAL_URI;
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected: " + process.env.MONGO_URI);
    
    // Seed database
    await seedDatabase();
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });

    startReminderJob();
    startEnergyCheckJob();
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB.");
    console.error(error.message);
    console.error(
      "\nLocal: install MongoDB and run mongod, or: docker run -d -p 27017:27017 --name mongo mongo:7"
    );
    console.error(
      "Atlas: set MONGO_URI in backend/.env to the full string from Atlas (Cluster → Connect → Drivers).\n"
    );
    process.exit(1);
  });
