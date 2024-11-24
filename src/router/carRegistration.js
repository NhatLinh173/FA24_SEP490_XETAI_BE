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
  getCarRegistrationsByDriverId,
  getCarRegistrationsByDriverIdAndStatus,
  getAllWithStatus,
} = require("../controller/carRegistrationController");

// Route tạo Car Registration mới
router.post(
  "/add",
  upload.fields([
    { name: "imageCar", maxCount: 10 },
    { name: "imageRegistration", maxCount: 10 },
  ]),
  createCarRegistration
);
router.get("/wait", getAllWithStatus);
// Route lấy tất cả Car Registrations
router.get("/", getAllCarRegistrations);

// Route lấy Car Registration theo ID
router.get("/:id", getCarRegistrationById);

// Route cập nhật thông tin Car Registration theo ID
router.put(
  "/:id",
  upload.fields([
    { name: "imageCar", maxCount: 10 },
    { name: "imageRegistration", maxCount: 10 },
  ]),
  updateCarRegistration
);

// Route xóa Car Registration theo ID
router.delete("/:id", deleteCarRegistration);

// Route cập nhật trạng thái Car Registration (chỉ cập nhật status)
router.patch("/update/status", updateCarRegistrationStatus);

// Route lấy Car Registration theo driverId
router.get("/driver/:driverId", getCarRegistrationsByDriverId);

// Route lấy Car Registration đã aprrove theo driverId
router.get("/driver/:driverId/status", getCarRegistrationsByDriverIdAndStatus);

module.exports = router;
