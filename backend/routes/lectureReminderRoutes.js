const express = require("express");
const router = express.Router();
const LectureReminder = require("../models/LectureReminder");

const owner = (req) => req.query.ownerKey || "default";

router.get("/", async (req, res) => {
  try {
    const rows = await LectureReminder.find({ ownerKey: owner(req) }).lean();
    res.json({ sessionIds: rows.map((r) => r.sessionNumericId) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/toggle", async (req, res) => {
  try {
    const sessionId = Number(req.body?.sessionId);
    if (!Number.isFinite(sessionId)) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    const key = owner(req);
    const existing = await LectureReminder.findOne({
      ownerKey: key,
      sessionNumericId: sessionId,
    });
    if (existing) {
      await existing.deleteOne();
      const rows = await LectureReminder.find({ ownerKey: key }).lean();
      return res.json({
        sessionIds: rows.map((r) => r.sessionNumericId),
      });
    }
    await LectureReminder.create({
      ownerKey: key,
      sessionNumericId: sessionId,
    });
    const rows = await LectureReminder.find({ ownerKey: key }).lean();
    res.json({ sessionIds: rows.map((r) => r.sessionNumericId) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
