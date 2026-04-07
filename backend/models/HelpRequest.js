const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    studentName: { type: String, required: true, trim: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    requestTo: {
      type: String,
      enum: ["Lecturer", "Instructor", "Senior Student"],
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["Individual", "Group"],
      required: true,
    },
    topic: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpRequest", helpRequestSchema);
