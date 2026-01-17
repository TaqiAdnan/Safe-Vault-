const path = require("path");
const fs = require("fs");
const multer = require("multer");

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // uploads/<userId>/<folderId>/
      const userId = req.user.id;
      const folderId = req.params.id;

      const dir = path.join(process.cwd(), "uploads", userId, folderId);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const random = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      cb(null, `${random}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
}

const upload = multer({
  storage: makeStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB each (غيرها براحتك)
    files: 10,
  },
});

module.exports = { upload };
