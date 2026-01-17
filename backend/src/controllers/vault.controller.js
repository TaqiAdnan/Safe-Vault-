const vaultService = require("../services/vault.service");

async function listRoot(req, res) {
  const userId = req.user.id;
  const data = await vaultService.listRootFolders(userId);
  res.json({ data });
}

async function createRoot(req, res) {
  const userId = req.user.id;
  const { name } = req.body;
  const data = await vaultService.createRootFolder(userId, name);
  res.status(201).json({ data });
}

async function rename(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;
  const data = await vaultService.renameFolder(userId, id, name);
  res.json({ data });
}

async function removeFolder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const data = await vaultService.deleteFolder(userId, id);
  res.json(data);
}

async function getItems(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const data = await vaultService.getFolderItems(userId, id);
  res.json({ data });
}

async function createSubFolder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;
  const data = await vaultService.createSubFolder(userId, id, name);
  res.status(201).json({ data });
}

async function createFile(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const data = await vaultService.createFileMetadata(userId, id, req.body);
  res.status(201).json({ data });
}

module.exports = {
  listRoot,
  createRoot,
  rename,
  removeFolder,
  getItems,
  createSubFolder,
  createFile,
};
