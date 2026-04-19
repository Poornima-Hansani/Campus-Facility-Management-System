const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
  {
    numericId: { type: Number, required: true, unique: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    rowCount: { type: Number, default: 0 },
    sessions: [{ type: Number }],
    uploadedBy: { type: String, default: "management" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);