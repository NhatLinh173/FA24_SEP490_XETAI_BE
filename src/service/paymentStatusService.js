const Payment = require("../model/paymentModel");

const paymentService = {
  createPayment: async (paymentData) => {
    const { orderCode, status, orderCodeStatus } = paymentData;
    if (!orderCode || !status || !orderCodeStatus) {
      throw new Error("Missing required fieds");
    }

    const newPayment = new Payment({ orderCode, status, orderCodeStatus });

    await newPayment.save();
    return newPayment;
  },
};

module.exports = paymentService;
