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

const updateEarningsHistory = async (req, res) => {
  const { driverId, amount } = req.body;

  if (!driverId || !amount) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp driverId và amount" });
  }

  const result = await driverService.updateEarnings(driverId, amount);

  if (result.success) {
    return res.status(200).json({ message: result.message });
  } else {
    return res
      .status(500)
      .json({ message: result.message, error: result.error });
  }
};

const getDriverEarnings = async (req, res) => {
  const { driverId } = req.params;
  try {
    if (!driverId) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const driver = await driverService.getDriverById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const earningsHistory = driver.earningsHistory;

    const earningsToday = driverService.getEarningsToday(earningsHistory);
    const earningsYesterday =
      driverService.getEarningsYesterday(earningsHistory);
    const earningsThisWeek = driverService.getEarningsThisWeek(earningsHistory);
    const earningsThisMonth =
      driverService.getEarningsThisMonth(earningsHistory);
    const earningsThisYear = driverService.getEarningsThisYear(earningsHistory);

    // Trả về kết quả
    return res.status(200).json({
      earningsToday,
      earningsYesterday,
      earningsThisWeek,
      earningsThisMonth,
      earningsThisYear,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching earnings", error });
  }
};
module.exports = {
  getDriverById,
  updateEarningsHistory,
  getDriverEarnings,
};
