const searchService = require("../services/search.service");

async function search(req, res) {
  const userId = req.user.id;
  const { q, type } = req.query;

  const data = await searchService.searchAll(userId, { q, type });
  return res.json({ data });
}

module.exports = { search };
