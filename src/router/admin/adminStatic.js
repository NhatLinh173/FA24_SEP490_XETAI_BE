const express = require("express");
const router = express.Router();
const {
  getSummaryData,
  getVisits,
  getStats,
  getCustomerAnalysis,
} = require("../../controller/admin/adminController");

router.get("/static/summary", getSummaryData);
router.get("/static/visits", getVisits);
router.get("/static/stats", getStats);
router.get("/static/customer-analysis", getCustomerAnalysis);
module.exports = router;
