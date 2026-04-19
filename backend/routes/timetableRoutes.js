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
    faculty: doc.faculty || "Computing",
    year: doc.year,
    specialization: doc.specialization || "SE",
    scheduleType: doc.scheduleType || "Weekday",
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
    const { lecturer, year, faculty, specialization, scheduleType } = req.query;
    let filter = {};
    
    if (lecturer) {
      filter.lecturer = { $regex: lecturer, $options: 'i' };
    }
    if (year) {
      filter.year = Number(year);
    }
    if (faculty) {
      filter.faculty = { $regex: faculty, $options: 'i' };
    }
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (scheduleType) {
      filter.scheduleType = scheduleType;
    }
    
    const list = await TimetableSession.find(filter).lean();
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

router.get("/lecturer", async (req, res) => {
  try {
    const { lecturer } = req.query;
    if (!lecturer) {
      return res.status(400).json({ message: "Lecturer name is required" });
    }
    const list = await TimetableSession.find({ 
      lecturer: { $regex: lecturer, $options: 'i' } 
    }).lean();
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

router.get("/student", async (req, res) => {
  try {
    const { year, faculty, specialization, scheduleType } = req.query;
    if (!year || !faculty) {
      return res.status(400).json({ message: "Year and faculty are required" });
    }
    let filter = { year: Number(year), faculty: { $regex: faculty, $options: 'i' } };
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (scheduleType) {
      filter.scheduleType = scheduleType;
    }
    const list = await TimetableSession.find(filter).lean();
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
      faculty,
      year,
      specialization,
      scheduleType,
    } = req.body;

    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanVenueName = String(venueName || "").trim();
    const cleanLecturer = buildLecturer(lecturerTitle, lecturerName);
    const cleanSessionType = String(sessionType || "").trim();
    const cleanFaculty = String(faculty || "Computing").trim();
    const cleanYear = Number(year) || 1;
    const cleanSpec = String(specialization || "SE").trim();
    const cleanScheduleType = (scheduleType === "Weekend" ? "Weekend" : "Weekday");

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
      faculty: cleanFaculty,
      year: cleanYear,
      specialization: cleanSpec,
      scheduleType: cleanScheduleType,
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
