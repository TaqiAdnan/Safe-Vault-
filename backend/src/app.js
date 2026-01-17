const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settings.routes.js");

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

app.use(require("./middlewares/errorHandler"));
module.exports = app;
