const express = require("express");
const router = express.Router();
const {
  getDriverById,
  updateEarningsHistory,
  getDriverEarnings,
} = require("../controller/driverController");

router.get("/statistics/:driverId", getDriverById);
router.put("/update-earnings", updateEarningsHistory);
router.get("/:driverId/earnings", getDriverEarnings);
module.exports = router;
