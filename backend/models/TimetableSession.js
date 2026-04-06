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
    /** @deprecated legacy rows only; prefer sessionType */
    venueType: { type: String, required: false },
    venueName: { type: String, required: true, trim: true },
    lecturer: { type: String, required: true, trim: true },
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimetableSession", timetableSessionSchema);
