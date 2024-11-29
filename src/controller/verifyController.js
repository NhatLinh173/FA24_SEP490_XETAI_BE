const verifyService = require("../service/verifyService");

const sendOtpController = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Số điện thoại là bắt buộc." });
  }

  try {
    const verificationId = await verifyService.sendOtp(phoneNumber);
    res.status(200).json({ verificationId });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi gửi OTP.", details: error.message });
  }
};

const verifyOtpController = async (req, res) => {
  const { phoneNumber, otpCode } = req.body;

  if (!phoneNumber || !otpCode) {
    return res
      .status(400)
      .json({ error: "Số điện thoại và mã OTP là bắt buộc." });
  }

  try {
    const message = await verifyService.verifyOtp(phoneNumber, otpCode);
    res.status(200).json({ message });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi xác minh OTP.", details: error.message });
  }
};

module.exports = { sendOtpController, verifyOtpController };
