const express = require("express");
const router = express.Router();
const EncouragementEmail = require("../models/EncouragementEmail");
const { nextNumericId } = require("../lib/nextNumericId");

function serialize(doc) {
  return {
    id: doc.numericId,
    studentId: doc.studentId,
    studentEmail: doc.studentEmail,
    moduleCode: doc.moduleCode,
    moduleName: doc.moduleName,
    subject: doc.subject,
    message: doc.message,
    sentDate: doc.sentDate,
    status: doc.status,
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

router.get("/", async (req, res) => {
  try {
    const list = await EncouragementEmail.find().sort({ numericId: -1 }).lean();
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      studentEmail,
      moduleCode,
      moduleName,
      subject,
      message,
    } = req.body;

    const cleanStudentId = String(studentId || "").trim().toUpperCase();
    const cleanStudentEmail = String(studentEmail || "").trim();
    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanSubject = String(subject || "").trim();
    const cleanMessage = String(message || "").trim();

    if (
      !cleanStudentId ||
      !cleanStudentEmail ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^IT\d{8}$/.test(cleanStudentId)) {
      return res.status(400).json({
        message: "Student ID must be in a format like IT23200001.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanStudentEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return res.status(400).json({
        message: "Module code must be in a format like IT3040.",
      });
    }

    if (cleanModuleName.length < 3) {
      return res.status(400).json({
        message: "Module name must contain at least 3 characters.",
      });
    }

    if (cleanSubject.length < 5) {
      return res
        .status(400)
        .json({ message: "Subject must contain at least 5 characters." });
    }

    if (cleanMessage.length < 10) {
      return res
        .status(400)
        .json({ message: "Message must contain at least 10 characters." });
    }

    const all = await EncouragementEmail.find().lean();
    const dup = all.some(
      (item) =>
        item.studentId === cleanStudentId &&
        item.moduleCode === cleanModuleCode &&
        item.subject.toLowerCase() === cleanSubject.toLowerCase()
    );
    if (dup) {
      return res.status(400).json({
        message: "A similar encouragement email has already been recorded.",
      });
    }

    const numericId = await nextNumericId(EncouragementEmail);
    const doc = await EncouragementEmail.create({
      numericId,
      studentId: cleanStudentId,
      studentEmail: cleanStudentEmail,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      subject: cleanSubject,
      message: cleanMessage,
      sentDate: todayISO(),
      status: "Sent",
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const deleted = await EncouragementEmail.findOneAndDelete({ numericId });
    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
