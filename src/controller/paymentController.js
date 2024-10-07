const paymentService = require("../service/paymentService");
const User = require("../model/userModel");
const createPaymentLink = async (req, res) => {
  const { description, returnUrl, cancelUrl, totalPrice, orderCodeStatus } =
    req.body;

  if (
    !totalPrice ||
    !returnUrl ||
    !cancelUrl ||
    !description ||
    !orderCodeStatus
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const body = {
    orderCode: Number(String(new Date().getTime()).slice(-6)),
    amount: totalPrice,
    description,
    cancelUrl: "http://localhost:3006/payment/failed",
    returnUrl: "http://localhost:3006/payment/success",
    orderCodeStatus,
  };

  try {
    const paymentLinkRes = await paymentService.createPaymentLink(body);
    console.log({
      amount: body.amount,
      returnUrl,
      cancelUrl,
      description,
      orderCodeStatus,
    });
    return res.json({
      error: 0,
      message: "Success",
      data: {
        bin: paymentLinkRes.bin,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        accountNumber: paymentLinkRes.accountNumber,
        accountName: paymentLinkRes.accountName,
        amount: paymentLinkRes.amount,
        description: paymentLinkRes.description,
        orderCode: paymentLinkRes.orderCode,
        qrCode: paymentLinkRes.qrCode,
        cancelUrl: body.cancelUrl,
        returnUrl: body.returnUrl,
        orderCodeStatus: body.orderCodeStatus,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: -1, message: "Fail", data: null });
  }
};

const getPaymentInfo = async (req, res) => {
  try {
    console.log("Fetching payment link information...");
    const order = await paymentService.getPaymentLinkInformation(
      req.params.orderId
    );
    console.log("Order fetched:", order);

    if (!order || order.status !== "PAID") {
      console.log("Order is not paid or does not exist.");
      return res.json({ error: -1, message: "failed", data: null });
    }

    if (!req.user || !req.user.id) {
      console.log("User ID is missing.");
      return res
        .status(400)
        .json({ error: -1, message: "User ID is missing", data: null });
    }

    const payment = await paymentService.getPaymentByOrderCode(order.orderCode);
    console.log("Payment fetched:", payment);

    if (!payment) {
      console.log("Payment not found.");
      return res
        .status(404)
        .json({ error: -1, message: "Payment not found", data: null });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    const fullName = user ? user.fullName : "";

    const updateData = {
      ...payment.toObject(),
      amount: order.amount,
      status: order.status,
      createdAt: new Date(order.createdAt),
      userId: userId,
      orderId: order.id,
      fullName: fullName,
    };

    console.log("Updating payment with data:", updateData);
    await paymentService.updatePaymentByOrderCode(order.orderCode, updateData);
    console.log("Payment updated successfully.");

    return res.json({ error: 0, message: "ok", data: updateData });
  } catch (error) {
    console.log("Error:", error);
    return res.json({ error: -1, message: "failed", data: null });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const body = req.body;
    const order = await paymentService.cancelPaymentLink(
      orderId,
      body.cancellationReason
    );
    if (!order) {
      return res.json({ error: -1, message: "failed", data: null });
    }
    return res.json({ error: 0, message: "ok", data: order });
  } catch (error) {
    console.error(error);
    return res.json({ error: -1, message: "failed", data: null });
  }
};

const confirmWebhook = async (req, res) => {
  const { webhookUrl } = req.body;
  try {
    await paymentService.confirmWebhook(webhookUrl);
    return res.json({ error: 0, message: "ok", data: null });
  } catch (error) {
    console.error(error);
    return res.json({ error: -1, message: "failed", data: null });
  }
};

const handlePaymentCallback = async (req, res) => {
  try {
    const { code, id, cancel, status, orderCode } = req.query;
    const userId = req.user.id;
    console.log(userId);
    if (!orderCode || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const paymentData = {
      orderCode: parseInt(orderCode, 10),
      status: status,
      userId: userId,
    };

    await paymentService.saveInitialPaymentInfo(paymentData);

    return res.json({ error: 0, message: "ok", data: null });
  } catch (error) {
    return res.status(500).json({ error: -1, message: "error" });
  }
};

const getPaymentByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await paymentService.getPaymentsByUserId(userId);
    return res.json({ error: 0, message: "ok", data: payments });
  } catch (error) {
    console.error(error);
    return res.json({ error: -1, message: "failed", data: null });
  }
};
module.exports = {
  createPaymentLink,
  getPaymentInfo,
  cancelPayment,
  handlePaymentCallback,
  confirmWebhook,
  getPaymentByUserId,
};
