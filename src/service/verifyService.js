const { createClient } = require("redis");
const { sendEmail } = require("../service/emailService");
const User = require("../model/userModel");
require("dotenv").config();

const client = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
client.connect().catch(console.error);

const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại trong hệ thống.");

  // Generate OTP and store it in Redis
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await client.setEx(email, 300, otpCode); // Save OTP in Redis for 5 minutes

  // Send OTP email using the email service
  await sendEmail(email, "Mã OTP xác thực", "otpVerification", otpCode);
  console.log("OTP sent to:", email);
  return otpCode;
};

const verifyOtp = async (email, otpCode) => {
  const storedOtp = await client.get(email);
  if (!storedOtp) throw new Error("OTP đã hết hạn hoặc không tồn tại.");
  if (otpCode !== storedOtp) throw new Error("OTP không chính xác.");

  // Delete OTP from Redis after successful verification
  await client.del(email);
  return "Xác thực thành công";
};

// Ensure Redis connection closes when not in use
process.on("exit", () => {
  client.quit();
});

module.exports = { sendOtp, verifyOtp };
