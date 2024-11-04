const express = require("express");
const router = express.Router();
const {
  getDriverById,
  updateDriverStatisticsController,
  getDriverStatistics,
} = require("../controller/driverController");

router.get("/getDriver/:driverId", getDriverById);
router.put("/statistics/:driverId", updateDriverStatisticsController);
router.get("/:driverId/statistics", getDriverStatistics);
module.exports = router;
