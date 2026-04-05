const mongoose = require("mongoose");

const timetableSessionSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    venueType: {
      type: String,
      enum: ["Lecture Hall", "Lab"],
      required: true,
    },
    venueName: { type: String, required: true, trim: true },
    lecturer: { type: String, required: true, trim: true },
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimetableSession", timetableSessionSchema);
