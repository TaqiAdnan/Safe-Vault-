const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 80 },
    titleLower: { type: String, required: true, trim: true },

    content: { type: String, default: "", trim: false },
  },
  { timestamps: true }
);

// for search/sort later
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, titleLower: 1 });

module.exports = mongoose.model("Note", noteSchema);
