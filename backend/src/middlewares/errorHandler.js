module.exports = (err, req, res, next) => {
  // multer file size error
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large", code: "FILE_TOO_LARGE" });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Server error";
  const code = err.code || "SERVER_ERROR";

  return res.status(status).json({ message, code });
};
