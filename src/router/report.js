const express = require("express");
const router = express.Router();
const {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
} = require("../controller/reportController");

router.post("/", createReport);
router.get("/:id", getReportById);
router.get("/", getAllReports);
router.delete("/:id", deleteReport);

module.exports = router;