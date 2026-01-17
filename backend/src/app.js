const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settings.routes.js");
const vaultRoutes = require("./routes/vault.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes");
const notesRoutes = require("./routes/note.routes");
const searchRoutes = require("./routes/search.routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/settings", settingsRoutes);
app.use("/notes", notesRoutes);
app.use("/search", searchRoutes);
app.use("/", uploadRoutes);
app.use("/folders", vaultRoutes); // keeps your frontend calls simple
app.use("/files", fileRoutes);
app.use(require("./middlewares/errorHandler"));
module.exports = app;
