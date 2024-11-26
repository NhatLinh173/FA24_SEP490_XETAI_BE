const favoriteDriverService = require("../service/favoriteDriverService");

const addFavorite = async (req, res) => {
  const { userId, driverId } = req.body;

  try {
    const result = await favoriteDriverService.addFavoriteDriver(
      userId,
      driverId
    );
    res.status(200).json({ message: "Driver added successfully", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding driver", error: error.message });
  }
};

const removeFavorite = async (req, res) => {
  const { userId, driverId } = req.body;

  try {
    const driver = await favoriteDriverService.removeFavoriteDriver(
      userId,
      driverId
    );
    res.status(200).json({ message: "Driver removed successfully", driver });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing driver", error: error.message });
  }
};

const getFavorite = async (req, res) => {
  const { userId } = req.params;

  try {
    const favorite = await favoriteDriverService.getFavoriteDrivers(userId);
    res
      .status(200)
      .json({ message: "Favorite drivers retrieved successfully", favorite });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving favorite drivers",
      error: error.message,
    });
  }
};

const getDriverDetailsController = async (req, res) => {
  const userId = req.params.userId;
  try {
    const driverDetails = await favoriteDriverService.getDriverDetails(userId);
    res.status(200).json({
      message: "Driver details retrieved successfully!!!",
      driverDetails,
    });
  } catch (error) {
    console.error(error);
    if (
      error.message === "User not found" ||
      error.message === "Driver not found"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An error occurred" });
    }
  }
};

const getFavoriteStatus = async (req, res) => {
  const { driverId, userId } = req.query;
  try {
    const isFavorite = await favoriteDriverService.getFavoriteStatus(
      driverId,
      userId
    );
    return res.status(200).json({ isFavorite });
  } catch (error) {
    console.log(error);
    console.error("Error fetching favorite status:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorite,
  getDriverDetailsController,
  getFavoriteStatus,
};
