const express = require("express");
const auth = require("../middlewares/requireAuthToken");
const validate = require("../middlewares/validate");
const validateObjectId = require("../middlewares/validateObjectId");
const { createNoteSchema, updateNoteSchema } = require("../validators/note.validation");
const noteController = require("../controllers/note.controller");

const router = express.Router();

router.use(auth);

router.get("/", noteController.list);
router.post("/", validate(createNoteSchema), noteController.create);

router.patch("/:id", validateObjectId("id"), validate(updateNoteSchema), noteController.update);
router.delete("/:id", validateObjectId("id"), noteController.remove);

module.exports = router;
