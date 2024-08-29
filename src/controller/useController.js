const authService = require("../service/userService");
const passport = require("../service/authGoogle");
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authService.registerUser(email, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authService.loginUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const newAccessToken = await authService.refreshUserToken(refreshToken);
    res.json(newAccessToken);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.blockUser(id);
    res.status(200).json({ message: "User has been blocked", user });
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

const googleAuth = passport.authenticate("google", {
  scope: ["email", "profile"],
});

const googleAuthCallback = passport.authenticate("google", {
  successRedirect: "http://localhost:3006/",
  failureRedirect: "http://localhost:3006/error",
});

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  getUserById,
  getAllUsers,
  register,
  login,
  refreshToken,
  googleAuth,
  googleAuthCallback,
  blockUser,
};
