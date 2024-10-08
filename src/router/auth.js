const express = require("express");
const upload = require("../utils/multer");
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
  updateUserController,
  changePasswordUser,
  getUserByRoleController,
  searchUsersController,
} = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
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
// http://localhost:3005/auth/update-user
router.put("/update-user/:id", upload.single("avatar"), updateUserController);
// http://localhost:3005/auth/change-password
router.put("/change-password", authMiddleware, changePasswordUser);
// http://localhost:3005/auth/role/:role
router.get("/role/:role", getUserByRoleController);
// http://localhost:3005/auth/search
router.get("/search", searchUsersController);

module.exports = router;
