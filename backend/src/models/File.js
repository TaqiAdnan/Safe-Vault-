const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true, index: true },

    originalName: { type: String, required: true, trim: true, maxlength: 200 },
    nameLower: { type: String, required: true, trim: true }, // originalName lower

    storedName: { type: String, required: true }, // random filename on disk
    storagePath: { type: String, required: true }, // absolute or relative path
    sizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
  },
  { timestamps: true }
);

// prevent duplicate original names inside same folder (per user)
fileSchema.index({ user: 1, folder: 1, nameLower: 1 }, { unique: true });

module.exports = mongoose.model("File", fileSchema);
