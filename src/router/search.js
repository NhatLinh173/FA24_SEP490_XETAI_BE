const express = require('express');
const router=express.Router();
const searchController = require('../controller/SearchController');

router.get("/",searchController.searchByStartPointAndDestination); //http://localhost:3005/search?startPoint=Hà Giang&destination=Lạng Sơn

module.exports = router;
