// src/middlewares/requireDeviceTempToken.js
const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing temp token", code: "MISSING_TEMP_TOKEN" });
  }

  try {
    const payload = verifyToken(token);

    if (payload.purpose !== "device_confirm" || !payload.userId || !payload.deviceId) {
      return res.status(401).json({ message: "Invalid temp token", code: "INVALID_TEMP_TOKEN" });
    }

    req.deviceConfirm = payload; // { userId, deviceId }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
};
