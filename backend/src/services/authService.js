const bcrypt = require("bcryptjs"); // hash passwords
const User = require("../models/User"); // user model

// signup business logic
exports.signup = async ({ fullName, email, password }) => {
  // simple validation
  if (!fullName || !email || !password) {
    const err = new Error("fullName, email, password are required"); // message
    err.statusCode = 400; // bad request
    throw err; // stop
  }

  // check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email already used"); // message
    err.statusCode = 409; // conflict
    throw err; // stop
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    isVerified: false, // not verified yet
  });

  return user; // return created user
};
