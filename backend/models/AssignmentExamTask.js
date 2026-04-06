const mongoose = require("mongoose");

const assignmentExamSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Assignment", "Exam"], required: true },
    dueDate: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentExamTask", assignmentExamSchema);
