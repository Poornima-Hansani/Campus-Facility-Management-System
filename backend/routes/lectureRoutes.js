const express = require("express");
const router = express.Router();
const LectureSession = require("../models/LectureSession");

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

router.get("/", async (req, res) => {
  try {
    const list = await LectureSession.find().sort({ numericId: 1 }).lean();
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
