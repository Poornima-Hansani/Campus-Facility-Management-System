const express = require("express");
const router = express.Router();
const TimetableSession = require("../models/TimetableSession");
const TimetableNotification = require("../models/TimetableNotification");
const UploadedFile = require("../models/UploadedFile");
const StudentTimeTable = require("../models/StudentTimeTable");
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
  "Revision",
  "Extra Class",
  "Workshop",
  "Discussion",
  "Assignment Help",
]);

// Convert time string to number (e.g., "09:00" -> 9.0, "09:30" -> 9.5)
function timeToNumber(t) {
  const [h, m] = t.split(':').map(Number);
  return h + (m === 30 ? 0.5 : 0);
}

// Sync timetable session to student timetables
async function syncSessionToStudentTimetables(session) {
  try {
    const { year, specialization, scheduleType, day, startTime, endTime, moduleCode, moduleName, lecturer, sessionType, venueName } = session;
    
    // Convert year number to Y1, Y2 format
    const dbYear = `Y${year}`;
    // Determine semester - default to S1
    const dbSemester = 'S1';
    // Convert schedule type
    const dbBatch = scheduleType === 'Weekend' ? 'WE' : 'WD';
    
    // Find all student timetables matching this group
    const matchingTimetables = await StudentTimeTable.find({
      year: dbYear,
      semester: dbSemester,
      batch: dbBatch,
      specialization: { $regex: new RegExp(specialization || '', 'i') }
    });
    
    const startNum = timeToNumber(startTime);
    const endNum = timeToNumber(endTime);
    
    for (const timetable of matchingTimetables) {
      // Add session to the timetable
      const newSession = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        day: day,
        startTime: startTime,
        endTime: endTime,
        startNum: startNum,
        endNum: endNum,
        type: sessionType || 'Lecture',
        subject: moduleCode,
        lecturer: lecturer,
        location: venueName
      };
      
      // Add to sessions array
      const existingSessions = timetable.sessions || [];
      existingSessions.push(newSession);
      
      // Recalculate free time for that day
      const daySessions = existingSessions.filter(s => s.day === day).sort((a, b) => a.startNum - b.startNum);
      
      // Calculate working hours based on batch
      const workingHours = dbBatch === 'WE' 
        ? { start: 8.0, end: 20.0 }
        : { start: 8.0, end: 17.5 };
      
      // Calculate free slots
      const busy = daySessions.map(s => ({ start: s.startNum, end: s.endNum }));
      const free = [];
      let currentTime = workingHours.start;
      
      for (const s of daySessions) {
        if (currentTime < s.startNum) {
          free.push({ start: currentTime, end: s.startNum });
        }
        currentTime = Math.max(currentTime, s.endNum);
      }
      if (currentTime < workingHours.end) {
        free.push({ start: currentTime, end: workingHours.end });
      }
      
      // Update freeTime for this day
      const updatedFreeTime = { ...timetable.freeTime };
      updatedFreeTime[day] = { busy, free };
      
      await StudentTimeTable.findByIdAndUpdate(timetable._id, {
        sessions: existingSessions,
        freeTime: updatedFreeTime
      });
      
      console.log(`Synced session to timetable ${timetable._id} (${dbYear}/${dbSemester}/${dbBatch}/${timetable.group})`);
    }
    
    return { success: true, synced: matchingTimetables.length };
  } catch (error) {
    console.error('Error syncing session to student timetables:', error);
    return { success: false, error: error.message };
  }
}

// Remove session from student timetables when deleted from management
async function removeSessionFromStudentTimetables(session) {
  try {
    const { year, specialization, scheduleType, day, startTime, endTime } = session;
    
    const dbYear = `Y${year}`;
    const dbSemester = 'S1';
    const dbBatch = scheduleType === 'Weekend' ? 'WE' : 'WD';
    
    const startNum = timeToNumber(startTime);
    const endNum = timeToNumber(endTime);
    
    // Find all matching student timetables
    const matchingTimetables = await StudentTimeTable.find({
      year: dbYear,
      semester: dbSemester,
      batch: dbBatch,
      specialization: { $regex: new RegExp(specialization || '', 'i') }
    });
    
    for (const timetable of matchingTimetables) {
      // Filter out the deleted session
      const remainingSessions = (timetable.sessions || []).filter(s => 
        !(s.day === day && s.startNum === startNum && s.endNum === endNum)
      );
      
      // Recalculate free time for that day
      const workingHours = dbBatch === 'WE' 
        ? { start: 8.0, end: 20.0 }
        : { start: 8.0, end: 17.5 };
      
      const daySessions = remainingSessions.filter(s => s.day === day).sort((a, b) => a.startNum - b.startNum);
      const busy = daySessions.map(s => ({ start: s.startNum, end: s.endNum }));
      const free = [];
      let currentTime = workingHours.start;
      
      for (const s of daySessions) {
        if (currentTime < s.startNum) {
          free.push({ start: currentTime, end: s.startNum });
        }
        currentTime = Math.max(currentTime, s.endNum);
      }
      if (currentTime < workingHours.end) {
        free.push({ start: currentTime, end: workingHours.end });
      }
      
      // Update freeTime for this day
      const updatedFreeTime = { ...timetable.freeTime };
      updatedFreeTime[day] = { busy, free };
      
      await StudentTimeTable.findByIdAndUpdate(timetable._id, {
        sessions: remainingSessions,
        freeTime: updatedFreeTime
      });
    }
    
    return { success: true, removed: matchingTimetables.length };
  } catch (error) {
    console.error('Error removing session from student timetables:', error);
    return { success: false, error: error.message };
  }
}

function resolveSessionType(doc) {
  const st = doc.sessionType;
  if (st && SESSION_TYPES.has(st)) return st;
  const legacy = doc.venueType;
  if (legacy === "Lecture Hall") return "Lecture";
  if (legacy === "Lab") return "Lab";
  return "Lecture";
}

function serialize(doc) {
  console.log("Serializing doc:", doc);
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
    specialization: doc.specialization || "Software Engineering",
    scheduleType: doc.scheduleType || "Weekday",
  };
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const LECTURER_TITLES = new Set(["Mr.", "Miss.", "Mrs.", "Ms.", "Dr.", "Prof."]);

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

router.get("/export", async (req, res) => {
  try {
    const list = await TimetableSession.find({}).lean();
    
    let csv = "moduleCode,moduleName,sessionType,venueName,lecturerTitle,lecturerName,day,startTime,endTime,faculty,year,specialization,scheduleType\n";
    
    list.forEach(row => {
      const titleMatch = row.lecturer?.match(/^(Mr\.|Miss\.|Mrs\.)/);
      const title = titleMatch ? titleMatch[0] : "Mr.";
      const name = titleMatch ? row.lecturer.replace(titleMatch[0], "").trim() : row.lecturer;
      
      csv += `${row.moduleCode},${row.moduleName},${row.sessionType || "Lecture"},${row.venueName},${title},${name},${row.day},${row.startTime},${row.endTime},${row.faculty || "Computing"},${row.year},${row.specialization || "SE"},${row.scheduleType || "Weekday"}\n`;
    });
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=timetable.csv");
    res.send(csv);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/pdf", async (req, res) => {
  try {
    const list = await TimetableSession.find({}).lean();
    list.sort((a, b) => {
      const d = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=timetable.pdf');
    doc.pipe(res);

    doc.fontSize(20).fillColor('black').text('Campus Timetable', { align: 'center' });
    doc.moveDown();

    let currentDay = '';
    list.forEach(session => {
      if (session.day !== currentDay) {
        currentDay = session.day;
        doc.moveDown();
        doc.fontSize(16).fillColor('#0d9488').text(currentDay, { underline: true });
        doc.moveDown(0.5);
      }
      doc.fontSize(12).fillColor('black').text(
        `${session.startTime} - ${session.endTime} | ${session.moduleCode} - ${session.moduleName}`
      );
      doc.fontSize(10).fillColor('gray').text(
        `Venue: ${session.venueName} | Lecturer: ${session.lecturer} | Type: ${session.sessionType || 'Lecture'}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/lecturer", async (req, res) => {
  try {
    const { lecturer } = req.query;
    console.log("Fetching lecturer timetable for:", lecturer);
    if (!lecturer) {
      return res.status(400).json({ message: "Lecturer name is required" });
    }
    const list = await TimetableSession.find({ 
      lecturer: { $regex: lecturer, $options: 'i' } 
    }).lean();
    console.log("Found sessions:", list.length);
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
  console.log("=== POST /api/timetable ===");
  console.log("Full Body:", JSON.stringify(req.body));
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

    // Minimal validation - create no matter what
    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase() || "TEST" + Date.now();
    const cleanModuleName = String(moduleName || "").trim() || "Test Module";
    const cleanVenueName = String(venueName || "").trim() || "Room 1";
    const cleanLecturer = buildLecturer(lecturerTitle, lecturerName) || "Mr. Test";
    let cleanSessionType = String(sessionType || "").trim();
    if (!cleanSessionType) cleanSessionType = "Lecture";
    else if (!SESSION_TYPES.has(cleanSessionType)) cleanSessionType = "Lecture";
    
    const cleanFaculty = String(faculty || "Computing").trim();
    const cleanYear = Number(year) || 1;
    const cleanSpec = String(specialization || "Software Engineering").trim();
    const cleanScheduleType = (scheduleType === "Weekend" ? "Weekend" : "Weekday");

    console.log("Creating with:", { cleanModuleCode, cleanModuleName, cleanVenueName, cleanLecturer, cleanSessionType, day, startTime, endTime });

    const numericId = await nextNumericId(TimetableSession);
    const doc = await TimetableSession.create({
      numericId,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      sessionType: cleanSessionType,
      venueName: cleanVenueName,
      lecturer: cleanLecturer,
      day: day || "Monday",
      startTime: startTime || "09:00",
      endTime: endTime || "10:00",
      faculty: cleanFaculty,
      year: cleanYear,
      specialization: cleanSpec,
      scheduleType: cleanScheduleType,
    });

    console.log("Created doc:", doc);

    // Auto-create notification
    try {
      const notifNumericId = await nextNumericId(TimetableNotification);
      await TimetableNotification.create({
        numericId: notifNumericId,
        type: "Created",
        moduleCode: cleanModuleCode,
        moduleName: cleanModuleName,
        lecturer: cleanLecturer,
        day: day || "Monday",
        specialization: cleanSpec,
        message: `New session added for ${cleanModuleCode} (${cleanModuleName}) on ${day || "Monday"} at ${startTime || "09:00"}`,
        targetAudience: "All",
      });
    } catch (notifErr) {
      console.log("Failed to auto-create notification:", notifErr);
    }
    
    // Auto-sync to student timetables for booking system
    try {
      const sessionData = {
        year: cleanYear,
        specialization: cleanSpec,
        scheduleType: cleanScheduleType,
        day: day || "Monday",
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        moduleCode: cleanModuleCode,
        moduleName: cleanModuleName,
        lecturer: cleanLecturer,
        sessionType: cleanSessionType,
        venueName: cleanVenueName
      };
      await syncSessionToStudentTimetables(sessionData);
    } catch (syncErr) {
      console.log("Failed to sync to student timetables:", syncErr);
    }

    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    console.log("Error creating timetable:", e);
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
    
    // Sync deletion to student timetables
    try {
      const sessionData = {
        year: deleted.year,
        specialization: deleted.specialization,
        scheduleType: deleted.scheduleType,
        day: deleted.day,
        startTime: deleted.startTime,
        endTime: deleted.endTime,
        moduleCode: deleted.moduleCode,
        moduleName: deleted.moduleName,
        lecturer: deleted.lecturer,
        sessionType: deleted.sessionType,
        venueName: deleted.venueName
      };
      // For deletion, we remove the session
      await removeSessionFromStudentTimetables(sessionData);
    } catch (syncErr) {
      console.log("Failed to sync deletion to student timetables:", syncErr);
    }
    
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Bulk sync all existing sessions to student timetables
router.post("/sync-to-booking", async (req, res) => {
  try {
    const allSessions = await TimetableSession.find({}).lean();
    let synced = 0;
    
    for (const session of allSessions) {
      const result = await syncSessionToStudentTimetables({
        year: session.year,
        specialization: session.specialization,
        scheduleType: session.scheduleType,
        day: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        moduleCode: session.moduleCode,
        moduleName: session.moduleName,
        lecturer: session.lecturer,
        sessionType: session.sessionType,
        venueName: session.venueName
      });
      if (result.success) synced++;
    }
    
    res.json({ 
      success: true, 
      message: `Synced ${synced} sessions to student timetables`,
      totalSessions: allSessions.length 
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const { userId, specialization } = req.query;
    
    let baseFilter = {};
    if (specialization) {
      baseFilter = {
        $or: [
          { specialization: specialization },
          { specialization: { $exists: false } },
          { specialization: null },
          { specialization: "" }
        ]
      };
    }
    
    let filter = { ...baseFilter };
    if (userId) {
      filter.readBy = { $ne: userId };
    }
    
    const notifications = await TimetableNotification.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const { type, moduleCode, moduleName, lecturer, day, message, targetAudience } = req.body;
    const numericId = await nextNumericId(TimetableNotification);
    const notification = await TimetableNotification.create({
      numericId,
      type: type || "Created",
      moduleCode: moduleCode || "",
      moduleName: moduleName || "",
      lecturer: lecturer || "",
      day: day || "",
      message: message || "New timetable uploaded",
      targetAudience: targetAudience || "All",
    });
    res.status(201).json(notification);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/notifications/lecturer", async (req, res) => {
  try {
    const { lecturer } = req.query;
    let filter = { 
      $or: [
        { targetAudience: { $in: ["All", "Lecturer"] } },
        { lecturer: { $regex: lecturer, $options: 'i' } }
      ]
    };
    const notifications = await TimetableNotification.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/notifications/:id/read", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const notification = await TimetableNotification.findOne({ numericId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }
    res.json({ message: "Marked as read" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/files", async (req, res) => {
  try {
    const files = await UploadedFile.find({}).sort({ createdAt: -1 }).lean();
    res.json(files);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/files", async (req, res) => {
  try {
    const { fileName, originalName, rowCount, sessionIds } = req.body;
    const numericId = await nextNumericId(UploadedFile);
    const file = await UploadedFile.create({
      numericId,
      fileName,
      originalName,
      rowCount: rowCount || 0,
      sessions: sessionIds || [],
    });
    res.status(201).json(file);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/files/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const file = await UploadedFile.findOne({ numericId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    if (file.sessions && file.sessions.length > 0) {
      await TimetableSession.deleteMany({ numericId: { $in: file.sessions } });
    }
    await UploadedFile.deleteOne({ numericId });
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
