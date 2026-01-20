const mongoose = require("mongoose");
const { SECURITY_QUESTIONS } = require("../constants/securityQuestions");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    status: { type: String, enum: ["PENDING", "ACTIVE"], default: "PENDING" },
    isVerified: { type: Boolean, default: false },

    securityQuestion: { type: String, enum: SECURITY_QUESTIONS, default: null },
    securityAnswerHash: { type: String, default: null },

    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    resetOtpHash: { type: String, default: null },
    resetOtpExpiresAt: { type: Date, default: null },
    mfaEnabled: { type: Boolean, default: false },
    mfaMethod: { type: String, enum: ["totp"], default: "totp" },
    mfaTotpSecret: { type: String, default: null }, 
    mfaVerifiedAt: { type: Date, default: null },


    trustedDevices: [
      {
        deviceId: { type: String, required: true },
        name: { type: String, default: "" },
        lastUsedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
