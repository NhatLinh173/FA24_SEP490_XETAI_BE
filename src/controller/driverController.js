const driverService = require("../service/driverService");
const Driver = require("../model/driverModel");
const getDriverById = async (req, res) => {
  const { driverId } = req.params;
  try {
    const result = await driverService.getDriverById(driverId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Tài xế không tồn tại" ||
      error.message === "Không tìm thấy thông tin người dùng"
    ) {
      return res.status(404).json({ message: error.message });
    }
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
    console.error("Error in getDriverStatistics:", error);

    if (error.message === "Driver not found") {
      return res.status(404).json({ message: "Không tìm thấy tài xế" });
    }
    if (error.message === "Invalid date range") {
      return res.status(400).json({ message: "Khoảng thời gian không hợp lệ" });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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

const updateDriverStatistics = async (driverId, { earnings, trips }) => {
  try {
    const numericEarnings = Number(earnings);
    const numericTrips = Number(trips);
    const currentYear = year || new Date().getFullYear();

    if (isNaN(numericEarnings) || isNaN(numericTrips)) {
      throw new Error("Trips and earnings must be valid numbers");
    }

    await driverService.updateDriverStatistics(driverId, {
      earnings: numericEarnings,
      trips: numericTrips,
      year: currentYear,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating driver statistics:", error.message);
    throw error;
  }
};

module.exports = {
  getDriverById,
  getDriverStatistics,
  updateDriverStatisticsController,
  updateDriverStatistics,
};
