const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();

const generateToken = (id, expiresIn, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

const registerUser = async ({
  email,
  password,
  role = "",
  phone = "",
  fullName = "",
  address = "",
}) => {
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
    fullName,
    address,
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
    role: user.role,
  };
};
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateToken(
    user._id,
    process.env.JWT_ACCESS_EXPIRATION,
    user.role
  );
  const refreshToken = generateToken(
    user._id,
    process.env.JWT_REFRESH_EXPIRATION,
    user.role
  );

  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    email: user.email,
    accessToken,
    refreshToken,
    role: user.role,
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

const updateUser = async (id, updatedUser) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const user = await User.findByIdAndUpdate(id, updatedUser, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteUser = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const blockUser = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { succcess: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid old password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error during password change:", error);
    return { success: false, message: "An error occurred" };
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
  blockUser,
  deleteUser,
  updateUser,
  getUserById,
  getAllUsers,
  changePassword,
};
