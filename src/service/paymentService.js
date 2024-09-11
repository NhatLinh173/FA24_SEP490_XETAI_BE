const payOs = require("../utils/payOs");
const Payment = require("../model/paymentModel");
const User = require("../model/userModel");
const createPaymentLink = async (body) => {
  return await payOs.createPaymentLink(body);
};

const getPaymentLinkInformation = async (orderId) => {
  return await payOs.getPaymentLinkInformation(orderId);
};

const cancelPaymentLink = async (orderId, cancellationReason) => {
  return await payOs.cancelPaymentLink(orderId, cancellationReason);
};

const confirmWebhook = async (webhookUrl) => {
  return await payOs.confirmWebhook(webhookUrl);
};

const savePaymentToDB = async (paymentData) => {
  try {
    if (!paymentData.orderId) {
      throw new Error("OrderID is required");
    }
    const payment = new Payment(paymentData);
    await payment.save();
  } catch (error) {
    console.error("Error saving payment to DB:", error);
  }
};

const saveInitialPaymentInfo = async (paymentData) => {
  try {
    const payment = new Payment({
      orderCode: paymentData.orderCode,
      status: paymentData.status,
      userId: paymentData.userId,
    });

    await payment.save();
  } catch (error) {
    console.error("Error saving initial payment info to DB:", error);
    throw error;
  }
};

const getPaymentByOrderCode = async (orderCode) => {
  try {
    const payment = await Payment.findOne({ orderCode })
      .populate("userId", "fullName")
      .exec();

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

const updatePaymentByOrderCode = async (orderCode, updateData) => {
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { orderCode },
      updateData,
      { new: true }
    )
      .populate("userId", "fullName")
      .exec();

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    return updatedPayment;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

const getPaymentsByUserId = async (userId) => {
  return await Payment.find({ userId });
};

module.exports = {
  createPaymentLink,
  getPaymentLinkInformation,
  cancelPaymentLink,
  confirmWebhook,
  savePaymentToDB,
  saveInitialPaymentInfo,
  getPaymentByOrderCode,
  updatePaymentByOrderCode,
  getPaymentsByUserId,
};
