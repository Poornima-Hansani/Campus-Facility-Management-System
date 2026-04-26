const mongoose = require("mongoose");

const facilityReportSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  location: { type: String, required: true },
  issueType: { type: String, required: true },
  comment: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "InProgress", "Fixed"],
    default: "Pending",
  },
  assignedTo: { type: String },
  assignedToId: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("FacilityReport", facilityReportSchema);