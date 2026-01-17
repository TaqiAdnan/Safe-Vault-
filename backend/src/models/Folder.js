const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null, index: true },

    name: { type: String, required: true, trim: true, maxlength: 50 },
    nameLower: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

folderSchema.index({ user: 1, parent: 1, nameLower: 1 }, { unique: true });

module.exports = mongoose.model("Folder", folderSchema);
