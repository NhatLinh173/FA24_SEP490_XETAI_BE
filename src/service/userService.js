const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Driver = require("../model/driverModel");
const Post = require("../model/postModel");
const Transaction = require("../model/transactionModel");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
dotenv.config();

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const users = await User.find({
      isBlocked: true,
      blockedUntil: { $ne: null },
    });

    for (const user of users) {
      if (now > user.blockedUntil) {
        user.isBlocked = false;
        user.blockedUntil = null;
        await user.save();
      }
    }
  } catch (error) {
    console.error("Error updating blocked users:", error);
  }
});
const generateToken = (id, expiresIn, role) => {
  if (!id) {
    throw new Error("User ID is required to generate a token");
  }

  if (typeof expiresIn !== "string" && typeof expiresIn !== "number") {
    throw new Error("expiresIn must be a string or number");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

const registerUser = async ({
  password,
  role = "",
  phone = "",
  fullName = "",
  address = "",
  email = "",
}) => {
  if ((!phone && !email) || !password) {
    throw new Error("Email or phone and password are required");
  }

  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      throw new Error("Phone already exists");
    }
  }

  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    password: hashedPassword,
    role,
    phone,
    email,
    fullName,
    address,
    refreshToken: "",
  });

  if (!user) {
    throw new Error("Failed to register user");
  }

  if (role === "personal") {
    await Driver.create({
      userId: user._id,
      fullName: user.fullName,
    });
  }

  const accessTokenExpiration = "1h";
  const refreshTokenExpiration = "7d";

  const accessToken = generateToken(user._id, accessTokenExpiration);
  const refreshToken = generateToken(user._id, refreshTokenExpiration);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    phone: user.phone,
    email: user.email,
    accessToken,
    refreshToken,
    role: user.role,
  };
};

const loginUser = async (identifier, password) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const query = isEmail ? { email: identifier } : { phone: identifier };

  const user = await User.findOne(query);
  if (!user) {
    throw {
      message: isEmail ? "Email không tồn tại" : "Số điện thoại không tồn tại",
      code: 404,
    };
  }

  if (user.isBlocked === true) {
    throw {
      message:
        "Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên để biết thêm chi tiết",
      code: 403,
    };
  }

  if (!user || !(await user.matchPassword(password))) {
    throw { message: "Mật khẩu không chính xác", code: 401 };
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

  const response = {
    _id: user._id,
    email: user.email,
    phone: user.phone,
    accessToken,
    role: user.role,
  };

  if (user.role === "personal" || user.role === "business") {
    const driver = await Driver.findOne({ userId: user._id });
    if (driver) {
      response.driverId = driver._id;
    }
  }

  return { user: response, refreshToken };
};

const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateToken(
      user._id,
      process.env.JWT_ACCESS_EXPIRATION,
      user.role
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

  try {
    const user = await User.findByIdAndUpdate(id, updatedUser, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error updating user in DB:", error);
    throw new Error(error.message);
  }
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

const blockUser = async (id, duration) => {
  if (!id) {
    throw new Error("User ID is required");
  }
  let blockedUntil = null;
  const now = new Date();

  switch (duration) {
    case "1day":
      blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case "3days":
      blockedUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      break;
    case "forever":
      blockedUntil = null;
      break;
    default:
      throw new Error("Invalid duration");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true, blockedUntil },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  await Post.updateMany({ creator: id }, { isLock: true });

  return user;
};

const unlockUser = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: false, blockedUntil: null },
    { new: true }
  );

  await Post.updateMany({ creator: id }, { isLock: true });
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

const getUserByRoleDriver = async (excludedRoles) => {
  try {
    const users = await Driver.find({
      role: { $nin: excludedRoles },
    }).populate("userId", "fullName email phone address avatar isBlocked");
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

const searchUser = async (phone) => {
  if (!phone) {
    throw new Error("Phone is required");
  }

  try {
    const users = await User.find({
      phone: { $regex: new RegExp(phone, "i") },
    });
    if (!users || users.length === 0) {
      throw new Error("User not found");
    }
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateBalance = async (userId, amount) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    const newBalance = (user.balance || 0) + amount;

    user.balance = newBalance;
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

const getTransactionsById = async (userId) => {
  try {
    const transaction = await Transaction.find({
      userId,
    }).sort({ createdAt: -1 });
    return transaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (email, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { email: email },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) {
      throw new Error("Người dùng không tồn tại!");
    }

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllCustomers = async () => {
  try {
    const customers = await User.find({ role: "customer" });

    const customersWithPostCount = await Promise.all(
      customers.map(async (customer) => {
        const postCount = await Post.countDocuments({
          creator: customer._id,
          status: "finish",
        });
        return {
          ...customer.toObject(),
          postCount,
        };
      })
    );

    return customersWithPostCount;
  } catch (error) {
    throw new Error(error.message);
  }
};

const addStaff = async ({ email, fullName }) => {
  const password = "staff123"; // Mật khẩu mặc định
  const role = "staff";

  const hashedPassword = await bcrypt.hash(password, 10);

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already exists");
  }

  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    fullName,
  });

  return user;
};

const getAllStaff = async () => {
  try {
    const staff = await User.find({ role: "staff" });
    return staff;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  addStaff,
  getAllStaff,
  getTransactionsById,
  searchUser,
  registerUser,
  loginUser,
  refreshUserToken,
  blockUser,
  deleteUser,
  updateUser,
  getUserById,
  getAllUsers,
  changePassword,
  getUserByRoleDriver,
  updateBalance,
  generateToken,
  unlockUser,
  resetPassword,
  getAllCustomers,
  addStaff,
  getAllStaff,
};
