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

module.exports = { addFavorite, removeFavorite, getFavorite };
