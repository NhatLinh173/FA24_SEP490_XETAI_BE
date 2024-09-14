const express = require('express');
const router=express.Router();
const RatingController = require('../controller/RatingController');

router.post("/",RatingController.addRating);

router.put("/",RatingController.updateRating);


module.exports = router;