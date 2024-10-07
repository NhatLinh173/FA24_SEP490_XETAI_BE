const express = require("express");
const router = express.Router();
const {
  createDeal,
  getAllDeals,
  getDealById,
  updateDealPrice,
  deleteDeal,
  updateDealStatus,
} = require("../controller/DealPriceController");

// Route để tạo Deal mới
router.post("/", createDeal);

// Route để lấy tất cả Deals
router.get("/", getAllDeals);

// Route để lấy Deal theo ID
router.get("/singleDeal", getDealById);

// Route để cập nhật dealPrice
router.patch("/price", updateDealPrice);

// Route để cập nhật trạng thái Deal
router.patch("/status", updateDealStatus);

// Route để xoá Deal
router.delete("/", deleteDeal);

module.exports = router;
