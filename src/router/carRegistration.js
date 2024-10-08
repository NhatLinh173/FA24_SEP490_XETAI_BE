const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createCarRegistration,
  getAllCarRegistrations,
  getCarRegistrationById,
  updateCarRegistration,
  deleteCarRegistration,
  updateCarRegistrationStatus,
} = require("../controller/carRegistrationController");

// Route tạo Car Registration mới
router.post("/", upload.array("cars", 10), createCarRegistration);

// Route lấy tất cả Car Registrations
router.get("/", getAllCarRegistrations);

// Route lấy Car Registration theo ID
router.get("/:id", getCarRegistrationById);

// Route cập nhật thông tin Car Registration theo ID
router.put("/:id", upload.array("cars", 10), updateCarRegistration);

// Route xóa Car Registration theo ID
router.delete("/:id", deleteCarRegistration);

// Route cập nhật trạng thái Car Registration (chỉ cập nhật status)
router.patch("/:id/status", updateCarRegistrationStatus);

module.exports = router;
