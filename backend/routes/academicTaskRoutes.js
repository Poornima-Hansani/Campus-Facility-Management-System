const express = require("express");
const router = express.Router();
const AcademicTask = require("../models/AcademicTask");
const Reminder = require("../models/Reminder");

// CREATE task + reminders
router.post("/", async (req, res) => {
  try {
    const { studentId, type, title, moduleCode, description, dueDateTime } = req.body;

    const dueDate = new Date(dueDateTime);
    const now = new Date();

    if (dueDate <= now) {
      return res.status(400).json({ message: "Due date must be in the future" });
    }

    const task = new AcademicTask({
      studentId,
      type,
      title,
      moduleCode,
      description,
      dueDateTime,
    });

    await task.save();

    const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000);

    const reminders = [];

    if (oneDayBefore > now) {
      reminders.push({
        studentId: task.studentId,
        reminderType: task.type,
        relatedItemId: task._id,
        title: `${task.title} - Reminder (1 day before)`,
        remindAt: oneDayBefore,
      });
    }

    if (oneHourBefore > now) {
      reminders.push({
        studentId: task.studentId,
        reminderType: task.type,
        relatedItemId: task._id,
        title: `${task.title} - Reminder (1 hour before)`,
        remindAt: oneHourBefore,
      });
    }

    if (reminders.length > 0) {
      await Reminder.insertMany(reminders);
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all tasks for one student
router.get("/student/:studentId", async (req, res) => {
  try {
    const tasks = await AcademicTask.find({ studentId: req.params.studentId }).sort({
      dueDateTime: 1,
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE task
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await AcademicTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await AcademicTask.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Reminder.deleteMany({ relatedItemId: req.params.id });

    res.json({ message: "Task and related reminders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;