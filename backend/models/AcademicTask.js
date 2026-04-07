const mongoose = require("mongoose");

const academicTaskSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["assignment", "exam"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    moduleCode: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    dueDateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicTask", academicTaskSchema);