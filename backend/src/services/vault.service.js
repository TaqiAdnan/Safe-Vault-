const mongoose = require("mongoose");
const Folder = require("../models/Folder");
const File = require("../models/File");
const { AppError } = require("../utils/appError");
const { formatBytes } = require("../utils/formatBytes");

const normalize = (s) => String(s || "").trim();
const lowerKey = (s) => normalize(s).toLowerCase();

async function ensureFolderOwned(userId, folderId) {
  const folder = await Folder.findOne({ _id: folderId, user: userId }).select("name parent");
  if (!folder) throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
  return folder;
}

async function listRootFolders(userId) {
  const folders = await Folder.find({ user: userId, parent: null })
    .sort({ createdAt: -1 })
    .select("name");

  if (!folders.length) return [];

  const folderIds = folders.map((f) => f._id);
  const userObjId = new mongoose.Types.ObjectId(userId);

  const [subCounts, fileCounts] = await Promise.all([
    Folder.aggregate([
      { $match: { user: userObjId, parent: { $in: folderIds } } },
      { $group: { _id: "$parent", count: { $sum: 1 } } },
    ]),
    File.aggregate([
      { $match: { user: userObjId, folder: { $in: folderIds } } },
      { $group: { _id: "$folder", count: { $sum: 1 } } },
    ]),
  ]);

  const map = new Map();
  for (const x of subCounts) map.set(String(x._id), (map.get(String(x._id)) || 0) + x.count);
  for (const x of fileCounts) map.set(String(x._id), (map.get(String(x._id)) || 0) + x.count);

  return folders.map((f) => ({
    id: f._id.toString(),
    name: f.name,
    count: map.get(f._id.toString()) || 0,
  }));
}


async function createRootFolder(userId, name) {
  const clean = normalize(name);
  if (!clean) throw new AppError("Folder name is required", 400, "FOLDER_NAME_REQUIRED");

  try {
    const folder = await Folder.create({
      user: userId,
      parent: null,
      name: clean,
      nameLower: lowerKey(clean),
    });

    return { id: folder._id.toString(), name: folder.name, count: 0 };
  } catch (e) {
    if (e && e.code === 11000) throw new AppError("Folder name already exists", 409, "FOLDER_NAME_EXISTS");
    throw e;
  }
}

async function createSubFolder(userId, parentId, name) {
  await ensureFolderOwned(userId, parentId);

  const clean = normalize(name);
  if (!clean) throw new AppError("Folder name is required", 400, "FOLDER_NAME_REQUIRED");

  try {
    const folder = await Folder.create({
      user: userId,
      parent: parentId,
      name: clean,
      nameLower: lowerKey(clean),
    });

    return { id: folder._id.toString(), type: "folder", name: folder.name, count: 0 };
  } catch (e) {
    if (e && e.code === 11000) throw new AppError("Folder name already exists", 409, "FOLDER_NAME_EXISTS");
    throw e;
  }
}

async function renameFolder(userId, folderId, name) {
  const folder = await ensureFolderOwned(userId, folderId);
  const clean = normalize(name);
  if (!clean) throw new AppError("Folder name is required", 400, "FOLDER_NAME_REQUIRED");

  folder.name = clean;
  folder.nameLower = lowerKey(clean);

  try {
    await folder.save();
  } catch (e) {
    if (e && e.code === 11000) throw new AppError("Folder name already exists", 409, "FOLDER_NAME_EXISTS");
    throw e;
  }

  return { id: folder._id.toString(), name: folder.name };
}

async function deleteFolder(userId, folderId) {
  await ensureFolderOwned(userId, folderId);

  const [subfolders, files] = await Promise.all([
    Folder.countDocuments({ user: userId, parent: folderId }),
    File.countDocuments({ user: userId, folder: folderId }),
  ]);

  if (subfolders > 0 || files > 0) {
    throw new AppError("Folder is not empty", 409, "FOLDER_NOT_EMPTY");
  }

  await Folder.deleteOne({ _id: folderId, user: userId });
  return { ok: true };
}


async function getFolderItems(userId, folderId) {
  const folder = await ensureFolderOwned(userId, folderId);

  const [subfolders, files] = await Promise.all([
    Folder.find({ user: userId, parent: folderId })
      .sort({ createdAt: -1 })
      .select("name"),
    // IMPORTANT: file schema uses originalName (not name)
    File.find({ user: userId, folder: folderId })
      .sort({ createdAt: -1 })
      .select("originalName sizeBytes mimeType createdAt"),
  ]);

  const subIds = subfolders.map((f) => f._id);
  const userObjId = new mongoose.Types.ObjectId(userId);

  const [subCounts, fileCounts] = await Promise.all([
    Folder.aggregate([
      { $match: { user: userObjId, parent: { $in: subIds } } },
      { $group: { _id: "$parent", count: { $sum: 1 } } },
    ]),
    File.aggregate([
      { $match: { user: userObjId, folder: { $in: subIds } } },
      { $group: { _id: "$folder", count: { $sum: 1 } } },
    ]),
  ]);

  const map = new Map();
  for (const x of subCounts) map.set(String(x._id), (map.get(String(x._id)) || 0) + x.count);
  for (const x of fileCounts) map.set(String(x._id), (map.get(String(x._id)) || 0) + x.count);

  const folderItems = subfolders.map((f) => ({
    id: f._id.toString(),
    type: "folder",
    name: f.name,
    count: map.get(f._id.toString()) || 0,
  }));

  const fileItems = files.map((fl) => ({
    id: fl._id.toString(),
    type: "file",
    // send a "name" field to frontend, based on originalName
    name: fl.originalName,
    sizeBytes: fl.sizeBytes || 0,
    size: formatBytes(fl.sizeBytes || 0),
    mimeType: fl.mimeType || "",
    createdAt: fl.createdAt,
  }));

  return {
    folder: { id: folderId, name: folder.name, parent: folder.parent },
    // IMPORTANT: merge arrays correctly
    items: [...folderItems, ...fileItems],
  };
}


async function createFileMetadata(userId, folderId, { name, sizeBytes, mimeType }) {
  await ensureFolderOwned(userId, folderId);

  const clean = normalize(name);
  if (!clean) throw new AppError("File name is required", 400, "FILE_NAME_REQUIRED");

  try {
    const file = await File.create({
      user: userId,
      folder: folderId,
      name: clean,
      nameLower: lowerKey(clean),
      sizeBytes: Number(sizeBytes || 0),
      mimeType: mimeType || "",
    });

    return {
      id: file._id.toString(),
      type: "file",
      name: file.name,
      sizeBytes: file.sizeBytes,
      size: formatBytes(file.sizeBytes),
    };
  } catch (e) {
    if (e && e.code === 11000) throw new AppError("File name already exists", 409, "FILE_NAME_EXISTS");
    throw e;
  }
}

async function deleteFile(userId, fileId) {
  const file = await File.findOneAndDelete({ _id: fileId, user: userId });
  if (!file) throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  return { ok: true };
}
const path = require("path");
const fs = require("fs");

async function exportFolder(userId, folderId) {
  const folder = await ensureFolderOwned(userId, folderId);

 
  const files = await File.find({ user: userId, folder: folderId })
    .sort({ createdAt: -1 })
    .select("originalName storagePath mimeType sizeBytes createdAt");

  return {
    id: folderId,
    name: folder.name,
    files: files.map((f) => ({
      id: f._id.toString(),
      name: f.originalName,          
      sizeBytes: f.sizeBytes || 0,
      mimeType: f.mimeType || "",
      createdAt: f.createdAt,
      storagePath: f.storagePath,    
    })),
  };
}



module.exports = {
  listRootFolders,
  createRootFolder,
  createSubFolder,
  renameFolder,
  deleteFolder,
  getFolderItems,
  createFileMetadata,
  deleteFile,
  exportFolder, 
};
