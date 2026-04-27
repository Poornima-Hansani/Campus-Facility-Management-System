const express = require("express");
const router = express.Router();
const HelpRequest = require("../models/HelpRequest");
const { nextNumericId } = require("../lib/nextNumericId");
const Notification = require("../models/Notification");

function serialize(doc) {
  return {
    id: doc.numericId,
    studentName: doc.studentName,
    moduleCode: doc.moduleCode,
    moduleName: doc.moduleName,
    requestTo: doc.requestTo,
    sessionType: doc.sessionType,
    topic: doc.topic,
    description: doc.description,
    status: doc.status,
  };
}

router.get("/", async (req, res) => {
  try {
    const list = await HelpRequest.find().sort({ numericId: -1 }).lean();
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      moduleCode,
      moduleName,
      requestTo,
      sessionType,
      topic,
      description,
    } = req.body;

    const cleanStudentName = String(studentName || "").trim();
    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanTopic = String(topic || "").trim();
    const cleanDescription = String(description || "").trim();

    if (
      !cleanStudentName ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !requestTo ||
      !sessionType ||
      !cleanTopic ||
      !cleanDescription
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (cleanStudentName.length < 3) {
      return res
        .status(400)
        .json({ message: "Student name must contain at least 3 characters." });
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

    if (cleanTopic.length < 4) {
      return res
        .status(400)
        .json({ message: "Topic must contain at least 4 characters." });
    }

    if (cleanDescription.length < 10) {
      return res
        .status(400)
        .json({ message: "Description must contain at least 10 characters." });
    }

    const all = await HelpRequest.find().lean();
    const dup = all.some(
      (item) =>
        item.studentName.toLowerCase() === cleanStudentName.toLowerCase() &&
        item.moduleCode === cleanModuleCode &&
        item.topic.toLowerCase() === cleanTopic.toLowerCase() &&
        (item.status === "Pending" || item.status === "Scheduled")
    );
    if (dup) {
      return res.status(400).json({
        message:
          "A similar active help request already exists for this student.",
      });
    }

    const numericId = await nextNumericId(HelpRequest);
    const doc = await HelpRequest.create({
      numericId,
      studentName: cleanStudentName,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      requestTo,
      sessionType,
      topic: cleanTopic,
      description: cleanDescription,
      status: "Pending",
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const deleted = await HelpRequest.findOneAndDelete({ numericId });
    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT update help request status - used by lecturers to schedule/complete requests
router.put("/:id/status", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const { status, scheduledDate, scheduledTime, notes } = req.body;
    
    if (!["Pending", "Scheduled", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const helpRequest = await HelpRequest.findOne({ numericId });
    if (!helpRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    helpRequest.status = status;
    if (scheduledDate) helpRequest.scheduledDate = scheduledDate;
    if (scheduledTime) helpRequest.scheduledTime = scheduledTime;
    if (notes) helpRequest.notes = notes;
    helpRequest.updatedAt = new Date();
    await helpRequest.save();
    
    // Create notification for the student about status update
    const notification = new Notification({
      type: 'help_request_update',
      recipientType: 'student',
      recipientId: helpRequest.studentName, // Using studentName as identifier
      message: status === 'Scheduled' 
        ? `Your help request for ${helpRequest.moduleCode} - ${helpRequest.topic} has been scheduled${scheduledDate ? ` for ${scheduledDate}` : ''}`
        : status === 'Completed'
        ? `Your help request for ${helpRequest.moduleCode} - ${helpRequest.topic} has been completed`
        : `Your help request for ${helpRequest.moduleCode} - ${helpRequest.topic} status is now ${status}`,
      moduleCode: helpRequest.moduleCode,
      moduleName: helpRequest.moduleName,
      topic: helpRequest.topic,
      helpRequestId: helpRequest.numericId,
      createdAt: new Date().toISOString(),
      read: false
    });
    await notification.save();
    
    res.json({ 
      message: "Status updated", 
      helpRequest: serialize(helpRequest),
      notification: "Student notified"
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Add notes/reply to help request - lecturer feedback
router.put("/:id/notes", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const { notes, reply } = req.body;
    
    const helpRequest = await HelpRequest.findOne({ numericId });
    if (!helpRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (notes) helpRequest.notes = notes;
    helpRequest.updatedAt = new Date();
    await helpRequest.save();
    
    // If there's a reply, create notification for student
    if (reply) {
      const notification = new Notification({
        type: 'help_request_reply',
        recipientType: 'student',
        recipientId: helpRequest.studentName,
        message: `Reply to your help request: ${reply}`,
        moduleCode: helpRequest.moduleCode,
        moduleName: helpRequest.moduleName,
        topic: helpRequest.topic,
        helpRequestId: helpRequest.numericId,
        reply: reply,
        createdAt: new Date().toISOString(),
        read: false
      });
      await notification.save();
    }
    
    res.json({ 
      message: "Notes updated",
      helpRequest: serialize(helpRequest),
      notification: reply ? "Student notified" : null
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
