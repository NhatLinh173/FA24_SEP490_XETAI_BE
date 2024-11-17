const verifyService = require("../service/verifyService");

const sendOtpController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email là bắt buộc." });
  }

  try {
    await verifyService.sendOtp(email);
    res.status(200).json({ message: "OTP đã được gửi qua email." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi gửi OTP.", details: error.message });
  }
};

const verifyOtpController = async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: "Email và mã OTP là bắt buộc." });
  }

  try {
    const message = await verifyService.verifyOtp(email, otpCode);
    res.status(200).json({ message });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi xác minh OTP.", details: error.message });
  }
};

module.exports = { sendOtpController, verifyOtpController };
