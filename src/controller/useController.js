const authService = require("../service/userService");
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

module.exports = {
  register,
  login,
  refreshToken,
};
