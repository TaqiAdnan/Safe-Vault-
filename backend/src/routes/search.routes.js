const express = require("express");
const auth = require("../middlewares/requireAuthToken");
const validateQuery = require("../middlewares/validateQuery");
const { searchSchema } = require("../validators/search.validation");
const searchController = require("../controllers/search.controller");

const router = express.Router();

router.use(auth);

// GET /search?q=...&type=all|notes|files|folders
router.get("/", validateQuery(searchSchema), searchController.search);

module.exports = router;
