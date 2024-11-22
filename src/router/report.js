const express = require("express");
const router = express.Router();
const {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
  getAllDriverPostIds,
  getAllPostIds,
  deleteReportAndLockPost,
} = require("../controller/reportController");

router.post("/", createReport);
router.get("/", getAllReports);
router.get("/post", getAllPostIds);
router.get("/driverPost", getAllDriverPostIds);
// router.delete("/:reportId", deleteReport);
router.delete("/:reportId", deleteReportAndLockPost);

router.get("/:reportId", getReportById);

module.exports = router;
