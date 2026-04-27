const User = require('../models/User');

const express = require("express");
const router = express.Router();
const EncouragementEmail = require("../models/EncouragementEmail");
const Notification = require('../models/Notification');
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

    // Validate using User collection - check if student exists
    const student = await User.findOne({ userId: cleanStudentId, role: 'student' });
    if (!student) {
      return res.status(400).json({
        message: "Student ID not found in the system. Please select a valid student.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanStudentEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
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
    
    // Create notification for the student
    try {
      const notification = new Notification({
        type: 'encouragement_email',
        recipientType: 'student',
        recipientId: cleanStudentId,
        message: `You received an encouragement email: ${cleanSubject} - ${cleanModuleCode}`,
        moduleCode: cleanModuleCode,
        moduleName: cleanModuleName,
        subject: cleanSubject,
        messageBody: cleanMessage,
        createdAt: new Date().toISOString(),
        read: false
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }
    
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
