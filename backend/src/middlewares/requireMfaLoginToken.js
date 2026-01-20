const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing MFA token", code: "MISSING_MFA_TOKEN" });

  try {
    const payload = verifyToken(token);

    if (payload.purpose !== "mfa_login" || !payload.userId) {
      return res.status(401).json({ message: "Invalid MFA token", code: "INVALID_MFA_TOKEN" });
    }

    req.mfa = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
};
