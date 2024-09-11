const payOs = require("../utils/payOs");

const verifyPaymentWebhook = (webhookData) => {
  return payOs.verifyPaymentWebhook(webhookData);
};

const isTestTransaction = (description) => {
  return ["Ma giao dich thu nghiem", "VQRIO123"].includes(description);
};

module.exports = {
  verifyPaymentWebhook,
  isTestTransaction,
};
