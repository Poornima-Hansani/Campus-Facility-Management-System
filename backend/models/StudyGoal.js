const mongoose = require("mongoose");

const studyGoalSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    goalType: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
    },
    targetHours: { type: Number, required: true, min: 1 },
    completedHours: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
    dueDate: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGoal", studyGoalSchema);
