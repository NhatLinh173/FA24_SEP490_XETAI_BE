const express = require("express");
const router = express.Router();
const {
  createDeal,
  getAllDeals,
  getDealById,
  updateDealPrice,
  deleteDeal,
  updateDealStatus,
  getDealsByDriverId,
  getDealsByPostIdAndStatusWait,
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
router.patch("/status/:postId", updateDealStatus);

// Route để xoá Deal
router.delete("/", deleteDeal);

// Route để lấy trạng thái wait và cancel của Deal
router.get("/driver/:driverId", getDealsByDriverId);

// Route để lấy trạng thái wait của Deal theo Post
router.get("/:postId", getDealsByPostIdAndStatusWait);

module.exports = router;
