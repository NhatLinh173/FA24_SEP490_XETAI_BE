const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createDriverPost,
  getAllDriverPosts,
  getDriverPostById,
  updateDriverPost,
  deleteDriverPost,
} = require("../controller/driverPostController");

// Route tạo driver post mới
router.post(
  "/",
  upload.array("images", 10),
  createDriverPost
);

// Route lấy tất cả driver posts
router.get("/", getAllDriverPosts);

// Route lấy driver post theo ID
router.get("/:id", getDriverPostById);

// Route cập nhật driver post theo ID
router.put(
  "/:id",
  upload.array("images", 10),
  updateDriverPost
);

// Route xóa driver post theo ID
router.delete("/:id", deleteDriverPost);

module.exports = router;
