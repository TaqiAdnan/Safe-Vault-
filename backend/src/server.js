const mongoose = require("mongoose"); // mongodb library
require("dotenv").config(); // read .env

const app = require("./app"); // import app

const PORT = process.env.PORT || 5000; // server port
const MONGO_URI = process.env.MONGO_URI; // mongo uri

// connect to database then run server
mongoose
  mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected"); // db ok
    app.listen(PORT, () => console.log("Server running on port " + PORT)); // start server
  })
  .catch((err) => console.log(err.message)); // db error
