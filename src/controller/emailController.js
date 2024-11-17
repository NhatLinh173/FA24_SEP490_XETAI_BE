const { sendEmail } = require("../service/emailService");

const sendEmailController = async (req, res) => {
  const { to, subject, templateName, templateArgs } = req.body;

  if (!to || !subject || !templateName || !templateArgs) {
    return res.status(400).json({
      message:
        "To, subject, templateName, and templateArgs are required fields.",
    });
  }

  if (!Array.isArray(templateArgs)) {
    return res.status(400).json({
      message: "templateArgs must be an array.",
    });
  }

  try {
    const response = await sendEmail(
      to,
      subject,
      templateName,
      ...templateArgs
    );

    if (response.success) {
      res.status(200).json({ message: "Email sent successfully." });
    } else {
      return res.status(500).json({
        message: "Failed to send email.",
        errorDetails: response.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error in sendEmailController:", error);
    return res.status(500).json({
      message: "An error occurred while sending the email.",
      errorDetails: error.message || "Unknown error",
    });
  }
};

module.exports = { sendEmailController };
