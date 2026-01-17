const express = require("express");
const router = express.Router();

const auth = require("../middlewares/requireAuthToken");
const asyncHandler = require("../middlewares/asyncHandler");
const validateObjectId = require("../middlewares/validateObjectId");
const { upload } = require("../middlewares/upload");

const uploadController = require("../controllers/upload.controller");

// Upload files into a folder
router.post(
  "/folders/:id/upload",
  auth,
  validateObjectId("id"),
  upload.array("files", 10), // field name = "files"
  asyncHandler(uploadController.uploadToFolder)
);

// Download a file
router.get(
  "/files/:id/download",
  auth,
  validateObjectId("id"),
  asyncHandler(uploadController.downloadFile)
);

module.exports = router;
