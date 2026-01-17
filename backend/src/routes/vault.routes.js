const express = require("express");
const router = express.Router();

const auth = require("../middlewares/requireAuthToken");
const validate = require("../middlewares/validate");
const validateObjectId = require("../middlewares/validateObjectId");
const asyncHandler = require("../middlewares/asyncHandler");

const vaultController = require("../controllers/vault.controller");
const { createFolderSchema, renameFolderSchema } = require("../validators/folder.validation");
const { createFileSchema } = require("../validators/file.validation");

router.use(auth);

// root folders
router.get("/", asyncHandler(vaultController.listRoot));
router.post("/", validate(createFolderSchema), asyncHandler(vaultController.createRoot));

// folder operations
router.get("/:id/items", validateObjectId("id"), asyncHandler(vaultController.getItems));
router.post("/:id/folders", validateObjectId("id"), validate(createFolderSchema), asyncHandler(vaultController.createSubFolder));
router.post("/:id/files", validateObjectId("id"), validate(createFileSchema), asyncHandler(vaultController.createFile));
router.patch("/:id", validateObjectId("id"), validate(renameFolderSchema), asyncHandler(vaultController.rename));
router.delete("/:id", validateObjectId("id"), asyncHandler(vaultController.removeFolder));

module.exports = router;
