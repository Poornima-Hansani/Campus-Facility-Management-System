const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, ".env") });

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

const PORT = Number(process.env.PORT) || 5000;
const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/unimanage";

let MONGO_URI = (process.env.MONGO_URI || "").trim();
if (!MONGO_URI) {
  MONGO_URI = DEFAULT_LOCAL_URI;
  console.warn(
    `MONGO_URI not set; using default local database: ${DEFAULT_LOCAL_URI}`
  );
}

if (
  MONGO_URI.includes("your-cluster-host") ||
  MONGO_URI.includes("YOUR_CLUSTER")
) {
  console.warn(
    "MONGO_URI looks like a placeholder Atlas host. Using local MongoDB instead."
  );
  console.warn(
    "Set MONGO_URI in backend/.env to your real Atlas connection string, or keep local URI."
  );
  MONGO_URI = DEFAULT_LOCAL_URI;
}

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

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
  })
  .then(async () => {
    console.log("MongoDB connected:", MONGO_URI.replace(/:[^:@]+@/, ":****@"));
    await seedDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });

    startReminderJob();
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
