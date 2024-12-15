const paymentService = require("../service/paymentService");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");
const Withdraw = require("../model/withdrawModel");
const Notification = require("../model/notificationModel");
const createPaymentLink = async (req, res) => {
  const {
    description,
    returnUrl,
    cancelUrl,
    totalPrice,
    orderCodeStatus,
    userId,
  } = req.body;

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
    cancelUrl: "https://xehang.online/payment/failed",
    returnUrl: "https://xehang.online/payment/success",
    orderCodeStatus,
  };

  try {
    const paymentLinkRes = await paymentService.createPaymentLink(body);

    const newTransaction = new Transaction({
      userId: userId,
      amount: totalPrice,
      type: "DEPOSIT",
      status: "PENDING",
      orderCode: paymentLinkRes.orderCode,
    });

    await newTransaction.save();
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

    await paymentService.updatePaymentByOrderCode(order.orderCode, updateData);

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
    // Log request body để debug
    console.log("Payment callback received:", req.body);

    const { status, orderCode } = req.body;

    if (!orderCode || !status) {
      console.log("Missing fields:", { status, orderCode });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Tìm transaction mà không cần userId (vì webhook từ cổng thanh toán không có thông tin này)
    const transaction = await Transaction.findOne({ orderCode });

    if (!transaction) {
      console.log("Transaction not found for orderCode:", orderCode);
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (status === "PAID" || status === "SUCCESS") {
      // Thêm case SUCCESS
      // Kiểm tra nếu transaction đã được xử lý
      if (transaction.status === "PAID") {
        return res.json({
          error: 0,
          message: "Transaction already processed",
          data: transaction,
        });
      }

      // Cập nhật trạng thái transaction
      transaction.status = "PAID";
      await transaction.save();

      // Tìm và cập nhật số dư user
      const user = await User.findById(transaction.userId);
      if (!user) {
        console.log("User not found:", transaction.userId);
        return res.status(404).json({ message: "User not found" });
      }

      // Cộng tiền vào tài khoản user
      user.balance += transaction.amount;
      await user.save();

      // Tạo thông báo
      const notification = new Notification({
        userId: transaction.userId,
        title: "Nạp tiền thành công",
        message: `Bạn đã nạp thành công ${transaction.amount.toLocaleString(
          "vi-VN"
        )} VNĐ vào tài khoản.`,
        data: {
          transactionId: transaction._id,
          amount: transaction.amount,
          type: "DEPOSIT",
        },
      });
      await notification.save();

      // Gửi thông báo realtime
      if (req.io) {
        req.io.to(transaction.userId.toString()).emit("receiveNotification", {
          title: "Nạp tiền thành công",
          message: `Bạn đã nạp thành công ${transaction.amount.toLocaleString(
            "vi-VN"
          )} VNĐ vào tài khoản.`,
          data: {
            transactionId: transaction._id,
            amount: transaction.amount,
            type: "DEPOSIT",
          },
          timestamp: new Date(),
        });
      }

      console.log("Payment processed successfully:", {
        transactionId: transaction._id,
        userId: transaction.userId,
        amount: transaction.amount,
        newBalance: user.balance,
      });

      return res.json({
        error: 0,
        message: "Transaction updated to PAID successfully",
        data: {
          transaction,
          newBalance: user.balance,
        },
      });
    } else if (status === "CANCELLED" || status === "FAILED") {
      await Transaction.deleteOne({ orderCode });
      console.log("Transaction cancelled:", orderCode);

      return res.json({
        error: 0,
        message: "Transaction deleted successfully",
        data: null,
      });
    } else {
      console.log("Invalid status received:", status);
      return res.status(400).json({ message: "Invalid status" });
    }
  } catch (error) {
    console.error("Error in handlePaymentCallback:", error);
    return res.status(500).json({
      error: -1,
      message: "Internal server error",
      data: null,
    });
  }
};

const generateOrderCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const withdrawRequest = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, userId, accountHolderName } =
      req.body;

    if (
      !amount ||
      !bankName ||
      !accountNumber ||
      !userId ||
      !accountHolderName
    ) {
      res.status(404).json({ message: "Missing required fields" });
    }

    const sanitizedAmount = Number(amount);
    if (isNaN(sanitizedAmount)) {
      return res.status(400).json({ message: "Invalid amount format" });
    }
    const orderCode = generateOrderCode();

    const newWithdraw = new Withdraw({
      amount: sanitizedAmount,
      bankName,
      accountNumber,
      userId,
      accountHolderName,
      orderCode,
      status: "PENDING",
    });
    await newWithdraw.save();
    return res
      .status(200)
      .json({ message: "New Withdraw Request Created", data: newWithdraw });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

const processWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawRequest = await Withdraw.findById(id);
    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }
    if (withdrawRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Withdraw request already processed" });
    }

    const user = await User.findById(withdrawRequest.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.balance -= withdrawRequest.amount;
    await user.save();

    const newTransaction = new Transaction({
      userId: withdrawRequest.userId,
      amount: withdrawRequest.amount,
      type: "WITHDRAW",
      status: "COMPLETED",
      orderCode: withdrawRequest.orderCode,
    });

    await newTransaction.save();

    withdrawRequest.status = "COMPLETED";
    await withdrawRequest.save();
    withdrawRequest.status = "COMPLETED";
    await withdrawRequest.save();

    const notification = new Notification({
      userId: withdrawRequest.userId,
      title: "Rút tiền thành công",
      message: `Số tiền ${withdrawRequest.amount} đã được chuyển thành công.`,
      data: {
        withdrawRequestId: withdrawRequest._id,
        status: "COMPLETED",
      },
    });
    await notification.save();

    req.io.to(withdrawRequest.userId.toString()).emit("receiveNotification", {
      title: "Rút tiền thành công",
      message: `Số tiền ${withdrawRequest.amount} đã được chuyển thành công.`,
      data: {
        withdrawRequestId: withdrawRequest._id,
        status: "COMPLETED",
      },
      timestamp: new Date(),
    });
    res.status(200).json({
      message: "Withdrawal processed successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllWithDraw = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({
      status: "PENDING",
    }).populate("userId", "fullName");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu rút tiền thành công",
      data: withdraws,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách yêu cầu rút tiền",
      error: error.message,
    });
  }
};

const rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawRequest = await Withdraw.findById(id);
    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }
    await withdrawRequest.deleteOne();

    res.status(200).json({ message: "Withdraw request rejected and deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transaction = await Transaction.find()
      .populate("userId", "email phone")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách giao dịch thành công",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentLink,
  getPaymentInfo,
  cancelPayment,
  handlePaymentCallback,
  confirmWebhook,
  getPaymentByUserId,
  processWithdrawRequest,
  getAllWithDraw,
  withdrawRequest,
  rejectWithdraw,
  getAllTransactions,
};
