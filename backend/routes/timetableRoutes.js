// backend/routes/timetableRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Timetable = require('../models/Timetable');
const LabTimetable = require('../models/LabTimetable');

// ✅ Get ONLY completed timetables
router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find({ status: 'completed' })
      .populate('days.slots.lecturer', 'name email')
      .sort({ createdAt: -1 });

    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('days.slots.lecturer', 'name email');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create timetable (always completed)
router.post('/', async (req, res) => {
  try {
    req.body.status = 'completed';

    const timetable = new Timetable(req.body);

    for (const day of timetable.days) {
      for (const slot of day.slots) {
        if (!mongoose.Types.ObjectId.isValid(slot.lecturer)) {
          return res.status(400).json({
            message: `Invalid lecturer ID at ${day.day}`,
          });
        }
      }
    }

    const saved = await timetable.save();

    // 🔥 UPDATE LAB TIMETABLE COLLECTION
    for (const day of saved.days) {
      for (const slot of day.slots) {
        await LabTimetable.findOneAndUpdate(
          { labNumber: slot.labNumber },
          {
            $push: {
              slots: {
                day: day.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'occupied',
                title: saved.title,
                lecturer: slot.lecturer,
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    const populated = await Timetable.findById(saved._id)
      .populate('days.slots.lecturer', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Update timetable (ALWAYS completed after edit)
router.put('/:id', async (req, res) => {
  try {
    req.body.status = 'completed';   // ⭐ CRITICAL FIX

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('days.slots.lecturer', 'name email');

    if (!updated) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Delete timetable
router.delete('/:id', async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const TimetableSession = require("../models/TimetableSession");
const { nextNumericId } = require("../lib/nextNumericId");

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SESSION_TYPES = new Set([
  "Lecture",
  "Practical",
  "Lab",
  "Tutorial",
]);

function resolveSessionType(doc) {
  const st = doc.sessionType;
  if (st && SESSION_TYPES.has(st)) return st;
  const legacy = doc.venueType;
  if (legacy === "Lecture Hall") return "Lecture";
  if (legacy === "Lab") return "Lab";
  return "Lecture";
}

function serialize(doc) {
  return {
    id: doc.numericId,
    moduleCode: doc.moduleCode,
    moduleName: doc.moduleName,
    sessionType: resolveSessionType(doc),
    venueName: doc.venueName,
    lecturer: doc.lecturer,
    day: doc.day,
    startTime: doc.startTime,
    endTime: doc.endTime,
  };
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const LECTURER_TITLES = new Set(["Mr.", "Miss.", "Mrs."]);

function normalizeSpaces(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ");
}

function buildLecturer(lecturerTitle, lecturerName) {
  const title = normalizeSpaces(lecturerTitle);
  const name = normalizeSpaces(lecturerName);
  if (!LECTURER_TITLES.has(title) || name.length < 2) return null;
  return `${title} ${name}`;
}

router.get("/", async (req, res) => {
  try {
    const list = await TimetableSession.find().lean();
    list.sort((a, b) => {
      const d = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      moduleCode,
      moduleName,
      sessionType,
      venueName,
      lecturerTitle,
      lecturerName,
      day,
      startTime,
      endTime,
    } = req.body;

    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanVenueName = String(venueName || "").trim();
    const cleanLecturer = buildLecturer(lecturerTitle, lecturerName);
    const cleanSessionType = String(sessionType || "").trim();

    if (
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanVenueName ||
      !cleanLecturer ||
      !day ||
      !startTime ||
      !endTime ||
      !cleanSessionType
    ) {
      return res.status(400).json({
        message:
          "All fields are required. Lecturer needs a title (Mr., Miss., or Mrs.) and a name (at least 2 characters).",
      });
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return res
        .status(400)
        .json({ message: "Module code must be in a format like IT3040." });
    }

    if (cleanModuleName.length < 3) {
      return res
        .status(400)
        .json({ message: "Module name must contain at least 3 characters." });
    }

    if (cleanVenueName.length < 2) {
      return res
        .status(400)
        .json({ message: "Venue name must contain at least 2 characters." });
    }

    if (!SESSION_TYPES.has(cleanSessionType)) {
      return res.status(400).json({
        message:
          "Session type must be Lecture, Practical, Lab, or Tutorial.",
      });
    }

    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const existing = await TimetableSession.find().lean();
    const dup = existing.some(
      (item) =>
        resolveSessionType(item) === cleanSessionType &&
        item.moduleCode === cleanModuleCode &&
        item.day === day &&
        item.startTime === startTime &&
        item.endTime === endTime &&
        item.venueName.toLowerCase() === cleanVenueName.toLowerCase() &&
        normalizeSpaces(item.lecturer) === normalizeSpaces(cleanLecturer)
    );
    if (dup) {
      return res
        .status(400)
        .json({ message: "This timetable session already exists." });
    }

    const sm = toMinutes(startTime);
    const em = toMinutes(endTime);
    const conflict = existing.some((item) => {
      if (item.day !== day) return false;
      if (item.moduleCode !== cleanModuleCode) return false;
      if (resolveSessionType(item) !== cleanSessionType) return false;
      if (item.venueName.toLowerCase() !== cleanVenueName.toLowerCase())
        return false;
      if (normalizeSpaces(item.lecturer) !== normalizeSpaces(cleanLecturer))
        return false;
      const is = toMinutes(item.startTime);
      const ie = toMinutes(item.endTime);
      return sm < ie && em > is;
    });
    if (conflict) {
      return res.status(400).json({
        message:
          "This slot clashes with another session for the same module, venue, and lecturer.",
      });
    }

    const numericId = await nextNumericId(TimetableSession);
    const doc = await TimetableSession.create({
      numericId,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      sessionType: cleanSessionType,
      venueName: cleanVenueName,
      lecturer: cleanLecturer,
      day,
      startTime,
      endTime,
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const deleted = await TimetableSession.findOneAndDelete({ numericId });
    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
