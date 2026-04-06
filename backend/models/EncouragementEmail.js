const mongoose = require("mongoose");

const encouragementEmailSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    studentId: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, trim: true },
    moduleCode: { type: String, required: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    sentDate: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Sent"], default: "Sent" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EncouragementEmail", encouragementEmailSchema);
