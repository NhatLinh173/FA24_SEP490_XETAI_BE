const express = require('express');
const router=express.Router();
const searchController = require('../controller/SearchController');

router.get("/:keyword",searchController.search);

module.exports = router;