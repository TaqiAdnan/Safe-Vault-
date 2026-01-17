const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing reset token", code: "MISSING_RESET_TOKEN" });
  }

  try {
    const payload = verifyToken(token);

    if (payload.purpose !== "reset" || !payload.userId) {
      return res.status(401).json({ message: "Invalid reset token", code: "INVALID_RESET_TOKEN" });
    }

    req.reset = payload; // { userId, step }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
};
