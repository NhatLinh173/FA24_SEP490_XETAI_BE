const express = require("express");
const router = express.Router();
const RatingController = require("../controller/RatingController");

router.post("/:postId", RatingController.addRating);

router.put("/", RatingController.updateRating);

// Lấy danh sách đánh giá của bản thân (do người khác đánh giá)
router.get("/my-ratings/:userId", RatingController.getMyRatings);
router.get("/ratings/post/:postId", RatingController.getRatingsByPost);
// Lấy danh sách mình đã đánh giá người khác
router.get(
  "/ratings-given/:reviewerId",
  RatingController.getRatingsGivenByUser
);

// lấy ra rating mình đánh giá chính xác tài xế đó
router.get("/rating-driver", RatingController.getRatingByReviewerForUser);

module.exports = router;
