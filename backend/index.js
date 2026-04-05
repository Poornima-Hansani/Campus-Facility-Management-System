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

// ✅ MongoDB connection (optional - system works without it)
let mongoConnected = false;
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
})
  .then(() => {
    console.log("MongoDB connected ✅");
    mongoConnected = true;
  })
  .catch((err) => console.log("MongoDB not available, using in-memory storage"));

// MongoDB Schemas (optional)
let RegisteredStaff;
try {
  const registeredStaffSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    specialty: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    registeredAt: { type: String, required: true }
  }, { collection: 'registered_staff' });
  RegisteredStaff = mongoose.model('RegisteredStaff', registeredStaffSchema);
} catch (e) {
  console.log("MongoDB models not available");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// In-memory data store for the presentation demo
let reports = [];

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

// Registered staff storage (for demo, in-memory - can be moved to MongoDB)
let registeredStaff = [];

// Notification system
const notifications = {
  staff: {},    // { staffId: [ { id, type, message, reportId, createdAt, read } ] }
  management: [], // [ { id, type, message, reportId, createdAt, read } ]
  student: {}     // { studentId: [ { id, type, message, reportId, createdAt, read } ] }
};

// Helper to create notification
const createNotification = (type, recipient, data) => {
  const notification = {
    id: generateId(),
    type,
    ...data,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  if (type === 'staff_assigned' || type === 'staff_fixed') {
    if (!notifications.staff[recipient]) {
      notifications.staff[recipient] = [];
    }
    notifications.staff[recipient].unshift(notification);
  } else if (type === 'management_fix_complete' || type === 'management_new_staff') {
    notifications.management.unshift(notification);
  } else if (type === 'student_fixed') {
    if (!notifications.student[recipient]) {
      notifications.student[recipient] = [];
    }
    notifications.student[recipient].unshift(notification);
  }
  
  return notification;
};

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
  const assigned = reports.filter(r => r.status === 'Assigned' || r.status === 'In Progress');
  
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

// GET /api/management/staff - Get all staff members (predefined + registered)
app.get('/api/management/staff', (req, res) => {
  try {
    const allStaff = [...staffMembers, ...registeredStaff];
    res.json({ staff: allStaff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/management/assign - Assign staff to issues
app.post('/api/management/assign', (req, res) => {
  try {
    const { ids, staffId } = req.body;
    console.log('=== ASSIGN REQUEST ===');
    console.log('IDs to assign:', ids);
    console.log('Staff ID:', staffId);
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = registeredStaff.find(s => s.id === staffId);
    }
    
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
        report.assignedToId = staff.id;
        report.assignedAt = new Date().toISOString();
        report.status = 'Assigned';
        report.updatedAt = new Date().toISOString();
        console.log('Report status after:', report.status);
        
        // Send notification to staff
        createNotification('staff_assigned', staff.id, {
          message: `You have been assigned a new task: ${report.issueType} at ${report.location}`,
          reportId: report.id,
          location: report.location,
          issueType: report.issueType
        });
      }
    });

    const assignedCount = reports.filter(r => r.status === 'Assigned').length;
    console.log('Total assigned reports:', assignedCount);
    console.log('=== END ASSIGN ===');
    
    res.json({ message: 'Staff assigned successfully', assignedTo: staff.name });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Failed to assign staff' });
  }
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

// ============= STAFF API ENDPOINTS =============

// POST /api/staff/register - Register new staff
app.post('/api/staff/register', (req, res) => {
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check phone in predefined staff
    const existingPhonePredefined = staffMembers.find(s => s.phone === phone);
    if (existingPhonePredefined) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Check phone in in-memory storage
    const existingPhoneMemory = registeredStaff.find(s => s.phone === phone);
    if (existingPhoneMemory) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Generate staff ID
    const staffId = `STF${String(registeredStaff.length + staffMembers.length + 1).padStart(3, '0')}`;
    
    const newStaffData = {
      id: staffId,
      name,
      role,
      specialty: specialty || role,
      phone,
      email,
      password,
      registeredAt: new Date().toISOString()
    };
    
    // Save to in-memory storage
    registeredStaff.push(newStaffData);
    
    // Try to save to MongoDB in background (non-blocking)
    if (RegisteredStaff && mongoConnected) {
      try {
        const newStaff = new RegisteredStaff(newStaffData);
        newStaff.save().catch(e => console.log('MongoDB sync failed'));
      } catch (e) {
        console.log('MongoDB save skipped');
      }
    }
    
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

// POST /api/staff/login - Staff login (supports both Staff ID and Email)
app.post('/api/staff/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Staff ID/Email and password are required' });
    }
    
    let foundStaff = null;
    let staffType = null;
    
    // Check predefined staff by ID
    const predefinedStaff = staffMembers.find(s => s.id === identifier);
    if (predefinedStaff) {
      foundStaff = predefinedStaff;
      staffType = 'predefined';
    }
    
    // Check registered staff by ID in memory
    if (!foundStaff) {
      const registeredById = registeredStaff.find(s => s.id === identifier);
      if (registeredById) {
        foundStaff = registeredById;
        staffType = 'registered';
      }
    }
    
    // Check registered staff by Email in memory
    if (!foundStaff) {
      const registeredByEmail = registeredStaff.find(s => s.email === identifier);
      if (registeredByEmail) {
        foundStaff = registeredByEmail;
        staffType = 'registered';
      }
    }
    
    if (!foundStaff) {
      return res.status(401).json({ error: 'Invalid Staff ID or Email' });
    }
    
    // Verify password
    if (staffType === 'predefined') {
      if (staffCredentials[foundStaff.id] !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      if (foundStaff.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/staff/profile - Get staff profile with stats
app.get('/api/staff/profile', (req, res) => {
  try {
    const { staffId } = req.query;
    
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = registeredStaff.find(s => s.id === staffId);
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const staffReports = reports.filter(r => r.assignedTo === staff.name);
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

// GET /api/staff/tasks - Get tasks assigned to a staff member
app.get('/api/staff/tasks', (req, res) => {
  try {
    const { staffId, filter } = req.query;
    
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = registeredStaff.find(s => s.id === staffId);
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    let staffReports = reports.filter(r => r.assignedTo === staff.name);
    
    // Apply filter
    if (filter === 'pending') {
      staffReports = staffReports.filter(r => r.status === 'Assigned');
    } else if (filter === 'inProgress') {
      staffReports = staffReports.filter(r => r.status === 'In Progress');
    } else if (filter === 'completed') {
      staffReports = staffReports.filter(r => r.status === 'Fixed');
    }
    
    // Sort by date (newest first)
    staffReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ tasks: staffReports });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PUT /api/staff/tasks/:id/status - Update task status
app.put('/api/staff/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['Assigned', 'In Progress', 'Fixed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const report = reports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (report.status === 'Fixed' && status !== 'Fixed') {
    return res.status(400).json({ error: 'Cannot revert a fixed task' });
  }
  
  const previousStatus = report.status;
  report.status = status;
  report.updatedAt = new Date().toISOString();
  
  if (status === 'Fixed') {
    report.fixedAt = new Date().toISOString();
    report.awaitingApproval = true;
    
    // Notify management that staff has fixed the issue
    createNotification('management_fix_complete', null, {
      message: `${report.assignedTo} has fixed: ${report.issueType} at ${report.location}`,
      reportId: report.id,
      staffName: report.assignedTo,
      location: report.location,
      issueType: report.issueType,
      studentId: report.studentId
    });
  }
  
  res.json({ message: 'Status updated', task: report });
});

// PUT /api/staff/tasks/:id/note - Add/update note on a task
app.put('/api/staff/tasks/:id/note', (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  
  const report = reports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  report.staffNote = note;
  report.noteUpdatedAt = new Date().toISOString();
  report.updatedAt = new Date().toISOString();
  
  res.json({ message: 'Note updated', task: report });
});

// GET /api/staff/feedback - Get feedback for a staff member
app.get('/api/staff/feedback', (req, res) => {
  try {
    const { staffId } = req.query;
    
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }
    
    let staff = staffMembers.find(s => s.id === staffId);
    
    if (!staff) {
      staff = registeredStaff.find(s => s.id === staffId);
    }
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const feedback = reports
      .filter(r => r.assignedTo === staff.name && r.status === 'Fixed' && r.rating !== null)
      .map(r => ({
        id: r.id,
        location: r.location,
        issueType: r.issueType,
        rating: r.rating,
        staffNote: r.staffNote,
        fixedAt: r.fixedAt,
        studentId: r.studentId
      }))
      .sort((a, b) => new Date(b.fixedAt) - new Date(a.fixedAt));
    
    res.json({ feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ============= NOTIFICATION ENDPOINTS =============

// GET /api/notifications/staff - Get staff notifications
app.get('/api/notifications/staff', (req, res) => {
  const { staffId } = req.query;
  
  if (!staffId) {
    return res.status(400).json({ error: 'Staff ID is required' });
  }
  
  const staffNotifications = notifications.staff[staffId] || [];
  res.json({ notifications: staffNotifications });
});

// PUT /api/notifications/staff/:id/read - Mark staff notification as read
app.put('/api/notifications/staff/:id/read', (req, res) => {
  const { id } = req.params;
  const { staffId } = req.query;
  
  if (!staffId) {
    return res.status(400).json({ error: 'Staff ID is required' });
  }
  
  const staffNotifications = notifications.staff[staffId] || [];
  const notification = staffNotifications.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
  }
  
  res.json({ message: 'Notification marked as read' });
});

// GET /api/notifications/management - Get management notifications
app.get('/api/notifications/management', (req, res) => {
  const managementNotifications = notifications.management || [];
  res.json({ notifications: managementNotifications });
});

// PUT /api/notifications/management/:id/read - Mark management notification as read
app.put('/api/notifications/management/:id/read', (req, res) => {
  const { id } = req.params;
  
  const notification = notifications.management.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
  }
  
  res.json({ message: 'Notification marked as read' });
});

// POST /api/management/approve-fix - Management approves fix and notifies student
app.post('/api/management/approve-fix', (req, res) => {
  const { reportId } = req.body;
  
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  if (!report.awaitingApproval) {
    return res.status(400).json({ error: 'This fix has already been approved or is not awaiting approval' });
  }
  
  report.awaitingApproval = false;
  report.status = 'Fixed';
  report.approvedAt = new Date().toISOString();
  report.updatedAt = new Date().toISOString();
  
  // Notify student
  createNotification('student_fixed', report.studentId, {
    message: `Your reported issue has been fixed: ${report.issueType} at ${report.location}`,
    reportId: report.id,
    location: report.location,
    issueType: report.issueType,
    staffName: report.assignedTo
  });
  
  // Mark management notification as read
  const mgmtNotification = notifications.management.find(n => n.reportId === reportId && n.type === 'management_fix_complete');
  if (mgmtNotification) {
    mgmtNotification.read = true;
  }
  
  res.json({ message: 'Fix approved and student notified', task: report });
});

// GET /api/notifications/student - Get student notifications
app.get('/api/notifications/student', (req, res) => {
  const { studentId } = req.query;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  const studentNotifications = notifications.student[studentId] || [];
  res.json({ notifications: studentNotifications });
});

// PUT /api/notifications/student/:id/read - Mark student notification as read
app.put('/api/notifications/student/:id/read', (req, res) => {
  const { id } = req.params;
  const { studentId } = req.query;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  const studentNotifications = notifications.student[studentId] || [];
  const notification = studentNotifications.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
  }
  
  res.json({ message: 'Notification marked as read' });
});

// Add some dummy initial data to show in presentation without 5 clicks
reports.push({ id: generateId(), studentId: 'OTHER_STU', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 86400000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU2', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 80000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU3', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 76000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU4', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date(Date.now() - 66000000).toISOString(), rating: null });
reports.push({ id: generateId(), studentId: 'OTHER_STU5', location: 'Block A Washroom (Gnd Floor)', issueType: 'Wet Floor', comment: '', status: 'Action Required', createdAt: new Date().toISOString(), rating: null });

// Staff assigned tasks for demo
reports.push({ id: generateId(), studentId: 'STU001', location: 'Lecture Room L101', issueType: 'A/C Not Working', comment: 'AC is making loud noise', status: 'Assigned', createdAt: new Date(Date.now() - 3600000).toISOString(), assignedTo: 'Kamal Perera', rating: null });
reports.push({ id: generateId(), studentId: 'STU002', location: 'Library Washroom 2F', issueType: 'Water Leak', comment: 'Tap is leaking', status: 'Assigned', createdAt: new Date(Date.now() - 7200000).toISOString(), assignedTo: 'Sunil Fernando', rating: null });
reports.push({ id: generateId(), studentId: 'STU003', location: 'Main Canteen', issueType: 'Cleanliness/Tidiness', comment: 'Floor needs mopping', status: 'In Progress', createdAt: new Date(Date.now() - 10800000).toISOString(), assignedTo: 'Nimal Silva', staffNote: 'Working on it, will finish by 2pm', rating: null });
reports.push({ id: generateId(), studentId: 'STU004', location: 'Lab 2', issueType: 'Projector Issue', comment: 'Projector not displaying', status: 'In Progress', createdAt: new Date(Date.now() - 14400000).toISOString(), assignedTo: 'Kamal Perera', staffNote: 'Replacing bulb, need to order new one', rating: null });
reports.push({ id: generateId(), studentId: 'STU005', location: 'Hall A', issueType: 'Door Lock Issue', comment: 'Back door lock broken', status: 'Fixed', createdAt: new Date(Date.now() - 86400000).toISOString(), assignedTo: 'Ranjith Jayawardena', fixedAt: new Date(Date.now() - 82800000).toISOString(), rating: 5 });
reports.push({ id: generateId(), studentId: 'STU006', location: 'Block B Washroom', issueType: 'Toilet Broken', comment: 'Toilet flush not working', status: 'Fixed', createdAt: new Date(Date.now() - 172800000).toISOString(), assignedTo: 'Sunil Fernando', fixedAt: new Date(Date.now() - 169200000).toISOString(), staffNote: 'Replaced flush mechanism', rating: 4 });
reports.push({ id: generateId(), studentId: 'STU007', location: 'Engineering Canteen', issueType: 'Water Faucet Broken', comment: 'Leaking faucet', status: 'Assigned', createdAt: new Date(Date.now() - 1800000).toISOString(), assignedTo: 'Sunil Fernando', rating: null });
reports.push({ id: generateId(), studentId: 'STU008', location: 'Computer Lab 3', issueType: 'Power Outlet', comment: 'Socket not working', status: 'Assigned', createdAt: new Date(Date.now() - 2700000).toISOString(), assignedTo: 'Ranjith Jayawardena', rating: null });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});