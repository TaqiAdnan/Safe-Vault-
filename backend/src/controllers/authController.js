const authService = require("../services/authService"); // auth logic

// POST /auth/signup
exports.signup = async (req, res) => {
  try {
    // call service
    const user = await authService.signup(req.body);

    // return success (no password)
    return res.status(201).json({
      message: "Account created",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    // handle known errors
    const status = err.statusCode || 500;
    const message = err.message || "Server error";
    return res.status(status).json({ message });
  }
};
