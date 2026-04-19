const mongoose = require("mongoose");

const timetableNotificationSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    type: { type: String, enum: ["Created", "Updated", "Deleted"], required: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, trim: true },
    day: { type: String, trim: true },
    time: { type: String, trim: true },
    venue: { type: String, trim: true },
    lecturer: { type: String, trim: true },
    year: { type: Number },
    specialization: { type: String, trim: true },
    scheduleType: { type: String, trim: true },
    message: { type: String, required: true },
    targetAudience: { type: String, enum: ["All", "Lecturer", "Students"], default: "All" },
    readBy: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimetableNotification", timetableNotificationSchema);