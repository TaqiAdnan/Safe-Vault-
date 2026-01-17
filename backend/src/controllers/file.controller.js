const vaultService = require("../services/vault.service");

async function deleteFile(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const data = await vaultService.deleteFile(userId, id);
  res.json(data);
}

module.exports = { deleteFile };
