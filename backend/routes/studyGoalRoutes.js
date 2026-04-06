const express = require("express");
const router = express.Router();
const StudyGoal = require("../models/StudyGoal");
const { nextNumericId } = require("../lib/nextNumericId");

const maxHoursByType = { Daily: 24, Weekly: 168, Monthly: 720 };

function serialize(doc) {
  return {
    id: doc.numericId,
    title: doc.title,
    goalType: doc.goalType,
    targetHours: doc.targetHours,
    completedHours: doc.completedHours,
    status: doc.status,
    dueDate: doc.dueDate ?? null,
  };
}

router.get("/", async (req, res) => {
  try {
    const list = await StudyGoal.find().sort({ numericId: -1 }).lean();
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, goalType, targetHours, dueDate } = req.body;
    const cleanTitle = String(title || "").trim();
    if (cleanTitle.length < 2) {
      return res
        .status(400)
        .json({ message: "Goal name must be at least 2 characters." });
    }

    const target = Number(targetHours);
    if (!goalType || Number.isNaN(target) || target <= 0) {
      return res
        .status(400)
        .json({ message: "Goal type and valid target hours are required." });
    }

    if (target > (maxHoursByType[goalType] || 0)) {
      return res.status(400).json({
        message: `${goalType} goal cannot exceed ${maxHoursByType[goalType]} hours.`,
      });
    }

    let due = dueDate && String(dueDate).trim() ? String(dueDate).trim() : null;
    if (due && Number.isNaN(Date.parse(due))) {
      return res.status(400).json({ message: "Choose a valid target date." });
    }

    const numericId = await nextNumericId(StudyGoal);
    const doc = await StudyGoal.create({
      numericId,
      title: cleanTitle,
      goalType,
      targetHours: target,
      completedHours: 0,
      status: "Active",
      dueDate: due,
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/:id/log", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const hours = Number(req.body?.hours);
    const goal = await StudyGoal.findOne({ numericId });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    if (Number.isNaN(hours) || hours <= 0) {
      return res
        .status(400)
        .json({ message: "Logged hours must be greater than 0." });
    }

    const updatedCompleted = Math.min(
      goal.completedHours + hours,
      goal.targetHours
    );
    goal.completedHours = updatedCompleted;
    goal.status =
      updatedCompleted >= goal.targetHours ? "Completed" : "Active";
    await goal.save();
    res.json(serialize(goal.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const deleted = await StudyGoal.findOneAndDelete({ numericId });
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
