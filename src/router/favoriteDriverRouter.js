const express = require("express");
const favoriteDriverController = require("../controller/favoriteDriverController");

const router = express.Router();
// http://localhost:3005/favorites/add
router.post("/add", favoriteDriverController.addFavorite);
// http://localhost:3005/favorites/remove
router.post("/remove", favoriteDriverController.removeFavorite);
// http://localhost:3005/favorites/:userId
router.get("/:userId", favoriteDriverController.getFavorite);
// http://localhost:3005/driver/:userId
router.get(
  "/details/:userId",
  favoriteDriverController.getDriverDetailsController
);
router.get("/check/status", favoriteDriverController.getFavoriteStatus);
module.exports = router;
