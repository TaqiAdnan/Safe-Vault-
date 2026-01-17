const noteService = require("../services/note.service");

async function list(req, res) {
  const userId = req.user.id;
  const data = await noteService.listNotes(userId);
  return res.json({ data });
}

async function create(req, res) {
  const userId = req.user.id;
  const data = await noteService.createNote(userId, req.body);
  return res.status(201).json({ data });
}

async function update(req, res) {
  const userId = req.user.id;
  const noteId = req.params.id;
  const data = await noteService.updateNote(userId, noteId, req.body);
  return res.json({ data });
}

async function remove(req, res) {
  const userId = req.user.id;
  const noteId = req.params.id;
  const data = await noteService.deleteNote(userId, noteId);
  return res.json({ data });
}

module.exports = { list, create, update, remove };
