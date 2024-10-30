const express = require("express");
const { sendEmailController } = require("../controller/emailController");

const router = express.Router();

router.post("/email", sendEmailController);

module.exports = router;
