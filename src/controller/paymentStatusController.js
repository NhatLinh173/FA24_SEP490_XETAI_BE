const paymentService = require("../service/paymentStatusService");

const paymentController = {
  createPaymentStatus: async (req, res) => {
    try {
      const paymentData = req.body;
      const newPayment = await paymentService.createPayment(paymentData);
      res
        .status(200)
        .json({ message: "Payment data saved successfully", data: newPayment });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving payment data", error: error.message });
    }
  },
};

module.exports = paymentController;
