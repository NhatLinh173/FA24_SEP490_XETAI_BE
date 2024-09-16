const express = require("express");
const favoriteDriverController = require("../controller/favoriteDriverController");

const router = express.Router();
// http://localhost:3005/favorites/add
router.post("/add", favoriteDriverController.addFavorite);
// http://localhost:3005/favorites/remove
router.post("/remove", favoriteDriverController.removeFavorite);
// http://localhost:3005/favorites/:userId
router.get("/:userId", favoriteDriverController.getFavorite);

module.exports = router;
