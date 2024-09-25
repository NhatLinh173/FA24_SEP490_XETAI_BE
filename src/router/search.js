const express = require('express');
const router=express.Router();
const searchController = require('../controller/SearchController');

//router.get("/:keyword",searchController.search);
router.get("/",searchByStartPointAndDestination.search); //http://localhost:3006/search?startPoint=Hanoi&destination=Saigon

module.exports = router;
