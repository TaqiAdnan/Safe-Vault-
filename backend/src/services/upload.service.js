const path = require("path");
const Folder = require("../models/Folder");
const File = require("../models/File");
const { AppError } = require("../utils/appError");

const normalize = (s) => String(s || "").trim();
const lowerKey = (s) => normalize(s).toLowerCase();

async function ensureFolderOwned(userId, folderId) {
  const folder = await Folder.findOne({ _id: folderId, user: userId }).select("_id");
  if (!folder) throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
}

async function saveUploadedFiles({ userId, folderId, files }) {
  await ensureFolderOwned(userId, folderId);

  if (!files || !files.length) {
    throw new AppError("No files uploaded", 400, "NO_FILES");
  }

  const saved = [];

  for (const f of files) {
    const originalName = normalize(f.originalname);
    const doc = {
      user: userId,
      folder: folderId,
      originalName,
      nameLower: lowerKey(originalName),
      storedName: f.filename,
      storagePath: f.path, // multer gives full path
      sizeBytes: f.size || 0,
      mimeType: f.mimetype || "",
    };

    try {
      const created = await File.create(doc);
      saved.push({
        id: created._id.toString(),
        type: "file",
        name: created.originalName,
        sizeBytes: created.sizeBytes,
        mimeType: created.mimeType,
      });
    } catch (e) {
      if (e && e.code === 11000) {
        // duplicate name in same folder
        throw new AppError(`File "${originalName}" already exists in this folder`, 409, "FILE_NAME_EXISTS");
      }
      throw e;
    }
  }

  return saved;
}

async function getFileForUser(userId, fileId) {
  const file = await File.findOne({ _id: fileId, user: userId });
  if (!file) throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  return file;
}

module.exports = {
  saveUploadedFiles,
  getFileForUser,
};
