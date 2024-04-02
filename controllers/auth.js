const User = require("../models/User");
const Statuscodes = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });

    const token = user.createJWT();
    res.status(Statuscodes.OK).json({ user: { name: user.name }, token });
  } catch (error) {
    if (
      error.name === "MongoError" &&
      error.code === 11000 &&
      error.keyPattern.email
    ) {
      // If the error is due to a duplicate email
      return res
        .status(Statuscodes.BAD_REQUEST)
        .json({ message: "Email is already in use" });
    }
    // For other errors
    res
      .status(Statuscodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("invalid credentials");
  }

  const isPasswordcorrect = await user.comparePassword(password);

  if (!isPasswordcorrect) {
    throw new UnauthenticatedError("invalid credentials");
  }
  const token = user.createJWT();
  res.status(Statuscodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};
