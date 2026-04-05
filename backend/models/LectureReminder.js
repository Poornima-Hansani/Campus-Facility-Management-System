const mongoose = require("mongoose");

const lectureReminderSchema = new mongoose.Schema(
  {
    ownerKey: { type: String, default: "default", index: true },
    sessionNumericId: { type: Number, required: true },
  },
  { timestamps: true }
);

lectureReminderSchema.index({ ownerKey: 1, sessionNumericId: 1 }, { unique: true });

module.exports = mongoose.model("LectureReminder", lectureReminderSchema);
