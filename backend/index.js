const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= FILE UPLOAD =================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ================= MONGODB =================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log(err));

// ================= MODELS =================
const reportSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  location: String,
  issueType: String,
  comment: String,
  status: { type: String, default: 'Pending' },
  createdAt: String,
  rating: Number,
  image: String
});

const Report = mongoose.model('Report', reportSchema);

// ================= ROUTES (FRIEND PART) =================
const academicTaskRoutes = require("./routes/academicTaskRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const lectureReminderRoutes = require("./routes/lectureReminderRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const assignmentExamRoutes = require("./routes/assignmentExamRoutes");
const studyGoalRoutes = require("./routes/studyGoalRoutes");
const helpRequestRoutes = require("./routes/helpRequestRoutes");
const managementEmailRoutes = require("./routes/managementEmailRoutes");

app.use("/api/tasks", academicTaskRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/lecture-reminders", lectureReminderRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/assignments-exams", assignmentExamRoutes);
app.use("/api/study-goals", studyGoalRoutes);
app.use("/api/help-requests", helpRequestRoutes);
app.use("/api/management/emails", managementEmailRoutes);

// ================= YOUR PART =================

// CREATE REPORT
app.post('/api/reports', upload.single('image'), async (req, res) => {
  try {
    const { location, issueType, comment, studentId } = req.body;

    const newReport = new Report({
      id: Math.random().toString(36).substring(7),
      studentId,
      location,
      issueType,
      comment,
      createdAt: new Date().toISOString(),
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newReport.save();
    res.json({ message: "Report created", report: newReport });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET REPORTS
app.get('/api/reports', async (req, res) => {
  const reports = await Report.find();
  res.json({ reports });
});

// ================= ROOT =================
app.get('/', (req, res) => {
  res.send('API Running 🚀');
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});