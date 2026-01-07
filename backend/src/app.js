const express = require("express"); // web framework

const authRoutes = require("./routes/authRoutes"); // auth routes

const app = express(); // create app

app.use(express.json()); // read json body

app.use("/auth", authRoutes); // prefix all auth routes

module.exports = app; // export app
