const router = require("express").Router(); // router

const { signup } = require("../controllers/authController"); // controller

router.post("/signup", signup); // POST /auth/signup

module.exports = router; // export router
