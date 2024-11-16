const express = require("express");
const upload = require("../utils/multer");
const {
  register,
  login,
  refreshTokenRequest,
  getAllUsers,
  getUserById,
  blockUser,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
  updateUserController,
  changePasswordUser,
  getUserByRoleDriverController,
  searchUsersController,
  updateBalanceController,
  getTransactions,
  unlockUser,
  resetPasswordController,
  getAllCustomers,
  addStaff,
  getAllStaff,
} = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
// http://localhost:3005/auth/register
router.post("/register", register);
// http://localhost:3005/auth/login
router.post("/login", login);
// http://localhost:3005/auth/refresh-token
router.post("/refresh-token", refreshTokenRequest);
// http://localhost:3005/auth/users
router.get("/users", getAllUsers);
// http://localhost:3005/auth/user/:id
router.get("/user/:id", getUserById);
// http://localhost:3005/auth/user/:id/block
router.put("/user/:id/block", blockUser);
// http://localhost:3005/auth/user/:id/unlock
router.put("/user/:id/unlock", unlockUser);
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
router.get("/role/driver", getUserByRoleDriverController);
// http://localhost:3005/auth/search
router.get("/search", searchUsersController);
// http://localhost:3005/auth/balance
router.put("/balance", updateBalanceController);
// http://localhost:3005/auth/transaction/:id
router.get("/transaction/:userId", getTransactions);
// http://localhost:3005/auth/forgotPassword
router.post("/resetPassword", resetPasswordController);
// http://localhost:3005/auth/users/customer
router.get("/users/customer", getAllCustomers);
// http://localhost:3005/auth/users/add-staff
router.post("/users/add-staff", addStaff);
// http://localhost:3005/auth/users/getAllStaff
router.get("/users/getAllStaff", getAllStaff);
module.exports = router;
