const nodemailer = require("nodemailer");
require("dotenv").config();
const sendEmail = async (to, subject, text) => {

    console.log("sucject" , subject);
  try {
    let transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    await transport.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = sendEmail;
