const FavoriteDrivers = require("../model/favoriteDriver");
const User = require("../model/userModel");

const addFavoriteDriver = async (userId, driverId) => {
  if (!userId || !driverId) {
    throw new Error("User ID and Driver ID are required");
  }

  try {
    const user = await User.findById(userId);
    const driver = await User.findById(driverId);

    if (!user || !driver) {
      throw new Error("User or Driver not found");
    }

    const existingFavorites = await FavoriteDrivers.findOne({
      userId,
      driverId,
    });
    if (existingFavorites) {
      throw new Error("This driver has already been added to your favorites");
    }

    const newFavorite = new FavoriteDrivers({ userId, driverId });
    return await newFavorite.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeFavoriteDriver = async (userId, driverId) => {
  if (!userId || !driverId) {
    throw new Error("User ID and Driver ID are required");
  }

  try {
    const result = await FavoriteDrivers.deleteOne({ userId, driverId });
    if (result.deletedCount === 0) {
      throw new Error("Favorite not found");
    }
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getFavoriteDrivers = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    return await FavoriteDrivers.findOne({ userId }).populate(
      "driverId",
      "fullName avatar"
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  addFavoriteDriver,
  removeFavoriteDriver,
  getFavoriteDrivers,
};
