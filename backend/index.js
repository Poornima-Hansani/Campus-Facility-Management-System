const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const academicTaskRoutes = require("./routes/academicTaskRoutes");
const Reminder = require("./models/Reminder");
const AcademicTask = require("./models/AcademicTask");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", academicTaskRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
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