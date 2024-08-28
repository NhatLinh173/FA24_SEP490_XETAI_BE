const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();
const accessTokenExpiration = process.env.JWT_ACCESS_EXPIRATION || "1h";
const refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || "7d";
const generateToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

const registerUser = async (
  email,
  password,
  role = "",
  phone = "",
  firstName = "",
  lastName = ""
) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    phone,
    firstName,
    lastName,
    refreshToken: "",
  });

  if (!user) {
    throw new Error("Failed to register user");
  }

  const accessTokenExpiration = "1h";
  const refreshTokenExpiration = "7d";

  const accessToken = generateToken(user._id, accessTokenExpiration);
  const refreshToken = generateToken(user._id, refreshTokenExpiration);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    email: user.email,
    accessToken,
    refreshToken,
  };
};
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateToken(
    user._id,
    process.env.JWT_ACCESS_EXPIRATION
  );
  const refreshToken = generateToken(
    user._id,
    process.env.JWT_REFRESH_EXPIRATION
  );

  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

const refreshUserToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateToken(
      user._id,
      process.env.JWT_ACCESS_EXPIRATION
    );

    return { accessToken };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
};
