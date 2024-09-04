const express = require("express");
const {
  register,
  login,
  refreshToken,
  getAllUsers,
  getUserById,
  blockUser,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
} = require("../controller/useController");

const router = express.Router();
// http://localhost:3005/auth/register
router.post("/register", register);
// http://localhost:3005/auth/login
router.post("/login", login);
// http://localhost:3005/auth/refresh-token
router.post("/refresh-token", refreshToken);
// http://localhost:3005/auth/users
router.get("/users", getAllUsers);
// http://localhost:3005/auth/user/:id
router.get("/user/:id", getUserById);
// http://localhost:3005/auth/user/:id/block
router.put("/user/:id/block", blockUser);
// http://localhost:3005/auth/google
router.get("/google", googleAuth);
// http://localhost:3005/auth/google/callback
router.get("/google/callback", googleAuthCallback);
// http://localhost:3005/auth/facebook
router.get("/facebook", facebookAuth);
// http://localhost:3005/auth/facebook/callback
router.get("/facebook/callback", facebookAuthCallback);

module.exports = router;
