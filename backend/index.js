const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const academicTaskRoutes = require("./routes/academicTaskRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const lectureReminderRoutes = require("./routes/lectureReminderRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const assignmentExamRoutes = require("./routes/assignmentExamRoutes");
const studyGoalRoutes = require("./routes/studyGoalRoutes");
const helpRequestRoutes = require("./routes/helpRequestRoutes");
const managementEmailRoutes = require("./routes/managementEmailRoutes");

const Reminder = require("./models/Reminder");
const AcademicTask = require("./models/AcademicTask");
const { seedDatabase } = require("./seed/seedDatabase");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", academicTaskRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/lecture-reminders", lectureReminderRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/assignments-exams", assignmentExamRoutes);
app.use("/api/study-goals", studyGoalRoutes);
app.use("/api/help-requests", helpRequestRoutes);
app.use("/api/management/emails", managementEmailRoutes);

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
    ],
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "Missing MONGO_URI. Create backend/.env with MONGO_URI=mongodb://127.0.0.1:27017/unimanage"
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

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
