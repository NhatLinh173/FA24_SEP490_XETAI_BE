const smsService = require("../service/smsService");

const sendSMSController = async (req, res) => {
  const { number, text } = req.body;
  if (!number || !text) {
    return res
      .status(400)
      .json({ message: "Number and text are required fields." });
  }

  try {
    const response = await smsService.sendSMS(number, text);
    res.status(200).json({ message: "Sms sent successfully.", response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendSMSController };
