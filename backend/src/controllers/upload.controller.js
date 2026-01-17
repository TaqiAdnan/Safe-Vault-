const path = require("path");
const fs = require("fs");
const uploadService = require("../services/upload.service");

async function uploadToFolder(req, res) {
  const userId = req.user.id;
  const folderId = req.params.id;

  const files = req.files || [];
  const saved = await uploadService.saveUploadedFiles({ userId, folderId, files });

  return res.status(201).json({ data: saved });
}

async function downloadFile(req, res) {
  const userId = req.user.id;
  const fileId = req.params.id;

  const file = await uploadService.getFileForUser(userId, fileId);

  // send download
  const abs = path.isAbsolute(file.storagePath)
    ? file.storagePath
    : path.join(process.cwd(), file.storagePath);

  if (!fs.existsSync(abs)) {
    return res.status(404).json({ message: "File missing on disk", code: "FILE_MISSING" });
  }

  res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
  // download with original filename
  return res.download(abs, file.originalName);
}

module.exports = { uploadToFolder, downloadFile };
