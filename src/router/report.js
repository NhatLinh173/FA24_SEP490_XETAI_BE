const express = require("express");
const router = express.Router();
const {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
} = require("../controller/reportController");

router.post("/", createReport);
router.get("/:reportId", getReportById);
router.get("/", getAllReports);
router.delete("/:reportId", deleteReport);

module.exports = router;