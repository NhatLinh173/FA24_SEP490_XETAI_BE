const express = require("express");
const router = express.Router();
const driverLocation = require("../controller/driverLocation");

router.get(
  "/driver-location/:orderCode",
  driverLocation.getLocationByOrderCode
);
router.put("/driver-location/:orderCode", driverLocation.updateDriverLocation);

module.exports = router;
