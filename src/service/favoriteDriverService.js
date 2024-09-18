const FavoriteDrivers = require("../model/favoriteDriver");
const User = require("../model/userModel");
const Driver = require("../model/driverModel");

const addFavoriteDriver = async (userId, driverId) => {
  if (!userId || !driverId) {
    throw new Error("User ID and Driver ID are required");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      throw new Error("Driver not found");
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
      "fullName avatar phone"
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getDriverDetails = async (userId) => {
  const user = await User.findById(userId);
  if (!userId) {
    throw new Error("User not found");
  }

  const driver = await Driver.findOne({ userId: userId });
  if (!driver) {
    throw new Error("Driver not found");
  }

  return {
    email: user.email,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
    fullName: user.fullName,
    tripsThisWeek: driver.tripsThisWeek,
    tripsThisWeek: driver.tripsThisWeek,
    rating: driver.rating,
    vehicle: driver.vehicle,
  };
};

module.exports = {
  addFavoriteDriver,
  removeFavoriteDriver,
  getFavoriteDrivers,
  getDriverDetails,
};
