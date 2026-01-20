const vaultService = require("../services/vault.service");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");

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

async function exportFolder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const data = await vaultService.exportFolder(userId, id);

  const safeName = (data.name || "folder").replace(/[^a-z0-9-_ ]/gi, "");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.zip"`);

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("ZIP error:", err);
    if (!res.headersSent) res.status(500);
    res.end();
  });

  archive.pipe(res);

  for (const f of data.files || []) {
    const abs = path.isAbsolute(f.storagePath)
      ? f.storagePath
      : path.join(process.cwd(), f.storagePath);

    // Adds the file using the original name (with extension)
    if (f.name && fs.existsSync(abs)) {
      archive.file(abs, { name: f.name });
    }
  }

  await archive.finalize();
}

module.exports = {
  listRoot,
  createRoot,
  rename,
  removeFolder,
  getItems,
  createSubFolder,
  createFile,
  exportFolder,
};
