const express = require('express');
const router=express.Router();
const RatingController = require('../controller/RatingController');

router.post("/",RatingController.addRating);

router.put("/",RatingController.updateRating);

// Lấy danh sách đánh giá của bản thân (do người khác đánh giá)
router.get('/my-ratings/:userId', RatingController.getMyRatings);

// Lấy danh sách mình đã đánh giá người khác
router.get('/ratings-given/:reviewerId', RatingController.getRatingsGivenByUser);

module.exports = router;