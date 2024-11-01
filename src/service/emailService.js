const nodemailer = require("nodemailer");
require("dotenv").config();
const emailTemplates = require("../utils/emailTemplate");

const sendEmail = async (to, subject, templateName, ...templateArgs) => {
  try {
    let transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = emailTemplates[templateName](...templateArgs);

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    await transport.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmail };
