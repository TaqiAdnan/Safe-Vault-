const express = require("express");
const router = express.Router();

const auth = require("../middlewares/requireAuthToken");
const validateObjectId = require("../middlewares/validateObjectId");
const asyncHandler = require("../middlewares/asyncHandler");

const fileController = require("../controllers/file.controller");

router.use(auth);

router.delete("/:id", validateObjectId("id"), asyncHandler(fileController.deleteFile));

module.exports = router;
