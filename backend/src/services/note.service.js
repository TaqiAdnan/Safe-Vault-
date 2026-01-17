const Note = require("../models/Note");
const { AppError } = require("../utils/appError");

const normalize = (s) => String(s || "").trim();
const lowerKey = (s) => normalize(s).toLowerCase();

async function ensureNoteOwned(userId, noteId) {
  const note = await Note.findOne({ _id: noteId, user: userId }).select("title content updatedAt");
  if (!note) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
  return note;
}

async function listNotes(userId) {
  const notes = await Note.find({ user: userId })
    .sort({ updatedAt: -1 })
    .select("title content updatedAt");

  return notes.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    content: n.content || "",
    updatedAt: n.updatedAt,
  }));
}

async function createNote(userId, { title, content }) {
  const t = normalize(title);
  if (!t) throw new AppError("Title is required", 400, "TITLE_REQUIRED");

  const note = await Note.create({
    user: userId,
    title: t,
    titleLower: lowerKey(t),
    content: content ?? "",
  });

  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content || "",
    updatedAt: note.updatedAt,
  };
}

async function updateNote(userId, noteId, { title, content }) {
  const note = await ensureNoteOwned(userId, noteId);

  if (typeof title !== "undefined") {
    const t = normalize(title);
    if (!t) throw new AppError("Title is required", 400, "TITLE_REQUIRED");
    note.title = t;
    note.titleLower = lowerKey(t);
  }

  if (typeof content !== "undefined") {
    note.content = content ?? "";
  }

  await note.save();

  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content || "",
    updatedAt: note.updatedAt,
  };
}

async function deleteNote(userId, noteId) {
  const r = await Note.deleteOne({ _id: noteId, user: userId });
  if (r.deletedCount === 0) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
  return { ok: true };
}

module.exports = { listNotes, createNote, updateNote, deleteNote };
