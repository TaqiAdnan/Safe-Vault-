const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token", code: "MISSING_AUTH_TOKEN" });
  }

  try {
    const payload = verifyToken(token);

    if (payload.purpose !== "auth" || !payload.userId) {
      return res.status(401).json({ message: "Invalid auth token", code: "INVALID_AUTH_TOKEN" });
    }

    req.user = { id: payload.userId }; 
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
};
