const mongoose = require("mongoose");
const Note = require("../models/Note");
const Folder = require("../models/Folder");
const File = require("../models/File");

const normalize = (s) => String(s || "").trim();
const lower = (s) => normalize(s).toLowerCase();

async function searchAll(userId, { q, type }) {
  const query = lower(q);
  const userObjId = new mongoose.Types.ObjectId(userId);

  const rx = new RegExp(escapeRegex(query), "i");

  const wantNotes = type === "all" || type === "notes";
  const wantFiles = type === "all" || type === "files";
  const wantFolders = type === "all" || type === "folders";

  const [notes, files, folders] = await Promise.all([
    wantNotes
      ? Note.find({
          user: userId,
          $or: [{ titleLower: rx }, { content: rx }],
        })
          .sort({ updatedAt: -1 })
          .limit(12)
          .select("title content updatedAt")
      : Promise.resolve([]),

    wantFiles
      ? File.find({
          user: userId,
          nameLower: rx,
        })
          .sort({ updatedAt: -1 })
          .limit(12)
          .select("name folder mimeType sizeBytes")
      : Promise.resolve([]),

    wantFolders
      ? Folder.find({
          user: userId,
          nameLower: rx,
        })
          .sort({ updatedAt: -1 })
          .limit(12)
          .select("name")
      : Promise.resolve([]),
  ]);

  // folders counts (direct items) for returned folders
  let folderCounts = new Map();
  if (folders.length) {
    const folderIds = folders.map((f) => f._id);

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

    folderCounts = new Map();
    for (const x of subCounts) folderCounts.set(String(x._id), (folderCounts.get(String(x._id)) || 0) + x.count);
    for (const x of fileCounts) folderCounts.set(String(x._id), (folderCounts.get(String(x._id)) || 0) + x.count);
  }

  return {
    notes: notes.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      preview: makePreview(n.content || ""),
      updatedAt: n.updatedAt,
    })),
    files: files.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      folderId: f.folder ? f.folder.toString() : null,
      type: inferFileType(f),
      sizeBytes: f.sizeBytes || 0,
    })),
    folders: folders.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      count: folderCounts.get(f._id.toString()) || 0,
    })),
  };
}

function inferFileType(f) {
  // best effort: from extension first, else mimeType
  const name = String(f.name || "");
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return ext || (String(f.mimeType || "").split("/")[1] || "file");
}

function makePreview(content) {
  const clean = String(content || "").replace(/\s+/g, " ").trim();
  if (!clean) return "—";
  return clean.length > 32 ? clean.slice(0, 32) + "..." : clean;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { searchAll };
