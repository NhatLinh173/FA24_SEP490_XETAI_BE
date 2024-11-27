const mongoose = require("mongoose");

const favoriteDriversSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
  },
  { timestamps: true }
);

const FavoriteDrivers = mongoose.model(
  "FavoriteDrivers",
  favoriteDriversSchema
);
module.exports = FavoriteDrivers;
