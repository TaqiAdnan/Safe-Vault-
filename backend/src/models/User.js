const mongoose = require("mongoose"); // mongodb schema

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true }, // user full name
    email: { type: String, required: true, unique: true }, // unique email
    password: { type: String, required: true }, // hashed password
    isVerified: { type: Boolean, default: false }, // email verified or not
  },
  { timestamps: true } // createdAt & updatedAt
);

module.exports = mongoose.model("User", userSchema); // export model
