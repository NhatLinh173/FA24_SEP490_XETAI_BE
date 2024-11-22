const driverService = require("../service/driverService");

const getDriverById = async (req, res) => {
  const { driverId } = req.params;
  try {
    const driver = await driverService.getDriverById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.status(200).json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getDriverStatistics = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { range } = req.query;
    const statistics = await driverService.getDriverStatistics(driverId, range);
    res.status(200).json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDriverStatisticsController = async (req, res) => {
  const { driverId } = req.params;
  let { earnings, trips } = req.body;

  if (driverId === undefined || !driverId) {
    return res.status(400).json({ message: "Driver ID is required" });
  }

  // Chuyển đổi earnings và trips thành số
  earnings = parseFloat(earnings);
  trips = parseInt(trips, 10);

  if (isNaN(earnings) || isNaN(trips)) {
    return res.status(400).json({
      message: "Earnings and trips must be valid numbers",
    });
  }

  if (earnings < 0 || trips < 0) {
    return res.status(400).json({
      message: "Earnings and trips cannot be negative",
    });
  }

  try {
    await driverService.updateDriverStatistics(driverId, { earnings, trips });
    res.status(200).json({ message: "Driver statistics updated successfully" });
  } catch (error) {
    console.error("Error updating driver statistics:", error.message);

    if (error.message === "Driver not found") {
      return res.status(404).json({ message: "Driver not found" });
    }

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getDriverById,
  getDriverStatistics,
  updateDriverStatisticsController,
};
