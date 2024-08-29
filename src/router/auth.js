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
} = require("../controller/useController");

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.get('/users', getAllUsers);

router.get('/user/:id', getUserById);

router.put('/user/:id/block', blockUser);

router.get('/google', googleAuth);

router.get('/google/callback', googleAuthCallback);
module.exports = router;
