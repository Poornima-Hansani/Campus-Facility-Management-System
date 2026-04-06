const express = require("express");
const router = express.Router();
const AssignmentExamTask = require("../models/AssignmentExamTask");
const { nextNumericId } = require("../lib/nextNumericId");

function serialize(doc) {
  return {
    id: doc.numericId,
    title: doc.title,
    moduleCode: doc.moduleCode,
    moduleName: doc.moduleName,
    type: doc.type,
    dueDate: doc.dueDate,
    description: doc.description,
  };
}

router.get("/", async (req, res) => {
  try {
    const list = await AssignmentExamTask.find()
      .sort({ dueDate: 1 })
      .lean();
    res.json(list.map(serialize));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      moduleCode,
      moduleName,
      type,
      dueDate,
      description,
    } = req.body;

    const cleanTitle = String(title || "").trim();
    const cleanModuleCode = String(moduleCode || "").trim().toUpperCase();
    const cleanModuleName = String(moduleName || "").trim();
    const cleanDescription = String(description || "").trim();

    if (
      !cleanTitle ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !type ||
      !dueDate ||
      !cleanDescription
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (cleanTitle.length < 3) {
      return res
        .status(400)
        .json({ message: "Title must contain at least 3 characters." });
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

    if (cleanDescription.length < 10) {
      return res
        .status(400)
        .json({ message: "Description must contain at least 10 characters." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dueDate);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) {
      return res
        .status(400)
        .json({ message: "Due date cannot be in the past." });
    }

    const all = await AssignmentExamTask.find().lean();
    const dup = all.some(
      (item) =>
        item.title.toLowerCase() === cleanTitle.toLowerCase() &&
        item.moduleCode === cleanModuleCode &&
        item.dueDate === dueDate
    );
    if (dup) {
      return res
        .status(400)
        .json({ message: "This assignment or exam already exists." });
    }

    const numericId = await nextNumericId(AssignmentExamTask);
    const doc = await AssignmentExamTask.create({
      numericId,
      title: cleanTitle,
      moduleCode: cleanModuleCode,
      moduleName: cleanModuleName,
      type,
      dueDate,
      description: cleanDescription,
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    const deleted = await AssignmentExamTask.findOneAndDelete({ numericId });
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Deleted", id: numericId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
