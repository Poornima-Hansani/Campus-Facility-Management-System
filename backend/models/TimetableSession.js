const mongoose = require("mongoose");

const timetableSessionSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    sessionType: {
      type: String,
      enum: ["Lecture", "Practical", "Lab", "Tutorial"],
      required: false,
    },
    venueType: { type: String, required: false },
    venueName: { type: String, required: true, trim: true },
    lecturer: { type: String, required: true, trim: true },
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    faculty: { type: String, default: "Computing", trim: true },
    year: { type: Number, required: true },
    specialization: { type: String, default: "SE", trim: true },
    scheduleType: { type: String, enum: ["Weekday", "Weekend"], default: "Weekday" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimetableSession", timetableSessionSchema);
