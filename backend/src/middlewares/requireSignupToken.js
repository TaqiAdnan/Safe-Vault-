// src/middlewares/requireSignupToken.js
const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing signup token", code: "MISSING_SIGNUP_TOKEN" });
  }

  try {
    const payload = verifyToken(token);

    if (payload.purpose !== "signup" || !payload.userId) {
      return res.status(401).json({ message: "Invalid signup token", code: "INVALID_SIGNUP_TOKEN" });
    }

    req.signup = payload; // { userId, purpose, step }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
};
