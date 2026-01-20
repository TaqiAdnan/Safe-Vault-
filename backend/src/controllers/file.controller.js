const vaultService = require("../services/vault.service");
const File = require("../models/File");

async function deleteFile(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const data = await vaultService.deleteFile(userId, id);
  res.json(data);
}

async function renameFile(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "New file name is required" });
  }

  // only rename files that belong to this user
  const file = await File.findOne({ _id: id, user: userId });
  if (!file) return res.status(404).json({ message: "File not found" });

  const newName = name.trim();

  file.originalName = newName;
  file.nameLower = newName.toLowerCase();

  await file.save();

  return res.json({ data: file });
}

module.exports = { deleteFile, renameFile};
