const sendEmail = require("../service/emailService");

const sendEmailController = async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ message: "To, subject, and text are required fields." }); 
  }
  try {
    const response = await sendEmail(to, subject, text);
    if (response.success) {
      res.status(200).json({ message: "Email sent successfully." });
    } else {
      res.status(500).json({ message: "Failed to send email." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = sendEmailController;
