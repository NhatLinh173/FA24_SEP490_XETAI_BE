const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/create", paymentController.createPaymentLink);
router.get(
  "/payment-info/:orderId",
  authMiddleware,
  paymentController.getPaymentInfo
);
router.put("/:orderId", paymentController.cancelPayment);
router.post("/confirm-webhook", paymentController.confirmWebhook);
router.get(
  "/callback-success",
  authMiddleware,
  paymentController.handlePaymentCallback
);
router.get(
  "/get-userId/:userId",
  authMiddleware,
  paymentController.getPaymentByUserId
);
router.get("/all/transaction", paymentController.getAllTransactions);
router.post("/withdraw", paymentController.withdrawRequest);
router.put("/withdraw/:id/process", paymentController.processWithdrawRequest);
router.get("/all/withdraw", paymentController.getAllWithDraw);
router.delete("/withdraw/:id/reject", paymentController.rejectWithdraw);
module.exports = router;
