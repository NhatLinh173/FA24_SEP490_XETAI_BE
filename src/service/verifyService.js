const admin = require("../config/firebaseConfig");
const User = require("../model/userModel");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
require("dotenv").config();

const sendOtp = async (phoneNumber) => {
  const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, "VN");

  if (!phoneNumberParsed || !phoneNumberParsed.isValid()) {
    throw new Error(
      "Số điện thoại phải ở định dạng quốc tế, ví dụ: +84912345678"
    );
  }

  const internationalPhoneNumber = phoneNumberParsed.format("E.164");

  try {
    const confirmationResult = await admin
      .auth()
      .signInWithPhoneNumber(internationalPhoneNumber);

    return confirmationResult.verificationId;
  } catch (error) {
    throw new Error("Lỗi khi gửi OTP: " + error.message);
  }
};

const verifyOtp = async (phoneNumber, otpCode) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(otpCode);
    if (decodedToken.phone_number !== phoneNumber) {
      throw new Error("Số điện thoại không khớp với mã OTP.");
    }

    return "Xác thực thành công";
  } catch (error) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
  }
};

module.exports = { sendOtp, verifyOtp };
