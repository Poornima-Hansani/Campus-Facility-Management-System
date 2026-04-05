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

function serialize(doc) {
  return {
    id: doc.numericId,
    moduleCode: doc.moduleCode,
    moduleName: doc.moduleName,
    venueType: doc.venueType,
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
      venueType,
      venueName,
      lecturer,
      day,
      startTime,
      endTime,
    } = req.body;

    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanVenueName = String(venueName || "").trim();
    const cleanLecturer = String(lecturer || "").trim();

    if (
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanVenueName ||
      !cleanLecturer ||
      !day ||
      !startTime ||
      !endTime ||
      !venueType
    ) {
      return res.status(400).json({ message: "All fields are required." });
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

    if (cleanLecturer.length < 3) {
      return res
        .status(400)
        .json({ message: "Lecturer name must contain at least 3 characters." });
    }

    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const existing = await TimetableSession.find().lean();
    const dup = existing.some(
      (item) =>
        item.moduleCode === cleanModuleCode &&
        item.day === day &&
        item.startTime === startTime &&
        item.endTime === endTime &&
        item.venueName.toLowerCase() === cleanVenueName.toLowerCase()
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
      const is = toMinutes(item.startTime);
      const ie = toMinutes(item.endTime);
      return sm < ie && em > is;
    });
    if (conflict) {
      return res.status(400).json({
        message: "Time conflict detected with another session on the same day.",
      });
    }

    const numericId = await nextNumericId(TimetableSession);
    const doc = await TimetableSession.create({
      numericId,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      venueType,
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
