const mongoose = require("mongoose");

module.exports = (paramName = "id") => (req, res, next) => {
  const v = req.params?.[paramName];
  if (!mongoose.Types.ObjectId.isValid(v)) {
    return res.status(400).json({ message: "Invalid id", code: "INVALID_ID" });
  }
  next();
};
