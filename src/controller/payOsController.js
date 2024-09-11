const payOsService = require("../service/payOsService");

const handlePayment = async (req, res) => {
  const webhookData = payOsService.verifyPaymentWebhook(req.body);

  if (payOsService.isTestTransaction(webhookData.description)) {
    return res.json({
      error: 0,
      message: "Ok",
      data: webhookData,
    });
  }

  return res.json({
    error: 0,
    message: "Ok",
    data: webhookData,
  });
};

module.exports = {
  handlePayment,
};
