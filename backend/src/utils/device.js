// src/utils/device.js
const crypto = require("crypto");

exports.makeDeviceId = (req, deviceName = "") => {
  const ua = req.headers["user-agent"] || "unknown";
  const ip = req.headers["x-forwarded-for"] || req.ip || "unknown";
  const raw = `${ua}::${deviceName}::${ip}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

exports.makeDeviceLabel = (req, deviceName = "") => {
  const ua = req.headers["user-agent"] || "Unknown Device";
  return deviceName ? `${deviceName} (${ua})` : ua;
};
