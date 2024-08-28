const express = require("express");
const {
  register,
  login,
  refreshToken,
} = require("../controller/useController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
// router.post("/google", verifyGoogleToken);
module.exports = router;
