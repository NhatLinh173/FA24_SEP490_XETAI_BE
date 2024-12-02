const authService = require("../service/userService");
const passport = require("../service/authGoogle");
const passportFacebook = require("../service/authFacebook");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const ms = require("ms");
const cloudinary = require("../config/cloudinaryConfig");
dotenv.config();

const register = async (req, res) => {
  const { password, fullName, phone, role, address, email } = req.body;

  if (!password || !fullName || !phone || !role) {
    return res
      .status(400)
      .json({ message: "You need fill full information when you register" });
  }

  try {
    const user = await authService.registerUser({
      password,
      role,
      phone,
      fullName,
      address,
      email,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const { user, refreshToken } = await authService.loginUser(
      identifier,
      password
    );
    const refreshTokenExpiration = ms(process.env.JWT_REFRESH_EXPIRATION);
    if (isNaN(refreshTokenExpiration)) {
      throw new Error("Invalid JWT_REFRESH_EXPIRATION value");
    }
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: refreshTokenExpiration * 1000,
    });
    res.status(200).json(user);
  } catch (error) {
    const statusCode = error.code || 500;
    res.status(statusCode).json({
      message: error.message,
      code: error.code || statusCode,
    });
  }
};

const refreshTokenRequest = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token available" });
  }

  try {
    const newAccessToken = await authService.refreshUserToken(refreshToken);
    res.json({ accessToken: newAccessToken.accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;
  const { duration } = req.body;

  try {
    const user = await authService.blockUser(id, duration);
    res.status(200).json({ message: "User has been blocked", user });
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

const unlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await authService.unlockUser(id);
    return res.status(200).json({ message: "User has been unlocked", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const facebookAuth = (req, res, next) => {
  passport.authenticate("facebook", {
    scope: ["email"],
    state: req.query.state,
  })(req, res, next);
};

const googleAuth = (req, res, next) => {
  const role = req.query.state;
  passport.authenticate("google", {
    scope: ["email", "profile"],
    state: role,
  })(req, res, next);
};

const googleAuthCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      return res.redirect(
        "http://localhost:3000/error?message=" + encodeURIComponent(err.message)
      );
    }
    if (!user) {
      return res.redirect(
        "http://localhost:3000/error?message=Authentication Failed"
      );
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res.redirect(
          "http://localhost:3000/error?message=" +
            encodeURIComponent(err.message)
        );
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const refreshToken = await authService.generateToken(
        user._id,
        process.env.JWT_REFRESH_EXPIRATION || "7d",
        user.role
      );

      const refreshTokenExpiration = ms(process.env.JWT_REFRESH_EXPIRATION);
      if (isNaN(refreshTokenExpiration)) {
        throw new Error("Invalid JWT_REFRESH_EXPIRATION value");
      }
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: refreshTokenExpiration * 1000,
      });
      const role = req.query.state;

      res.redirect(`http://localhost:3000/?token=${token}`);
    });
  })(req, res, next);
};

const facebookAuthCallback = (req, res, next) => {
  passport.authenticate("facebook", (err, user, info) => {
    if (err) {
      return res.redirect(`/error?message=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      return res.redirect(`/error?message=Authentication Failed`);
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res.redirect(
          `/error?message=${encodeURIComponent(err.message)}`
        );
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const refreshToken = await authService.generateToken(
        user._id,
        process.env.JWT_REFRESH_EXPIRATION || "7d",
        user.role
      );

      const refreshTokenExpiration = ms(process.env.JWT_REFRESH_EXPIRATION);
      if (isNaN(refreshTokenExpiration)) {
        throw new Error("Invalid JWT_REFRESH_EXPIRATION value");
      }
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: refreshTokenExpiration * 1000,
      });

      res.redirect(`http://localhost:3000/?token=${token}`);
    });
  })(req, res, next);
};

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/signIn");
};

const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await authService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const updateUserController = async (req, res) => {
  const { id } = req.params;
  const { email, password, phone, fullName, address, avatar } = req.body;
  const avatarFile = req.file;

  try {
    let avatarUrl = avatar;

    if (avatarFile) {
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "avatars" }, (error, result) => {
              if (error) {
                return reject(new Error(error.message));
              }
              resolve(result.secure_url);
            })
            .end(avatarFile.buffer);
        });

        avatarUrl = await uploadPromise;
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Failed to upload avatar" });
      }
    }
    const updatedUser = await authService.updateUser(id, {
      email,
      password,
      phone,
      fullName,
      address,
      avatar: avatarUrl,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User has been updated", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const changePasswordUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    if (result.success) {
      return res.status(200).json({ message: "User has been updated" });
    } else {
      return res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getUserByRoleDriverController = async (req, res) => {
  try {
    const excludedRoles = ["customer", "admin", "staff"];
    const users = await authService.getUserByRoleDriver(excludedRoles);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users by role:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const searchUsersController = async (req, res) => {
  const { phone } = req.query;
  try {
    const users = await authService.searchUser(phone);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

const updateBalanceController = async (req, res) => {
  const { userId, amount } = req.body;

  const parsedAmount = parseFloat(amount);
  if (!userId || isNaN(parsedAmount)) {
    return res
      .status(400)
      .json({ message: "Missing or invalid required fields" });
  }

  try {
    const updatedUser = await authService.updateBalance(userId, parsedAmount);

    return res
      .status(200)
      .json({ message: "Updated balance successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating balance:", error);
    return res.status(500).json({ message: "Error updating balance" });
  }
};

const getTransactions = async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await authService.getTransactionsById(userId);
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordController = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await authService.resetPassword(email, newPassword);
    res.status(200).json({ message: "Password updated successfully", user });
  } catch (error) {
    console.error("Error forgotting password:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await authService.getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addStaff = async (req, res) => {
  const { email, fullName } = req.body;

  if (!email || !fullName) {
    return res
      .status(400)
      .json({ message: "You need fill full information when you register" });
  }

  try {
    const user = await authService.addStaff({
      email,
      fullName,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await authService.getAllStaff();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  updateBalanceController,
  searchUsersController,
  facebookAuth,
  facebookAuthCallback,
  getUserById,
  getAllUsers,
  register,
  login,
  refreshTokenRequest,
  googleAuth,
  googleAuthCallback,
  blockUser,
  ensureAuthenticated,
  updateUserController,
  changePasswordUser,
  getUserByRoleDriverController,
  unlockUser,
  resetPasswordController,
  getAllCustomers,
  addStaff,
  getAllStaff,
};
