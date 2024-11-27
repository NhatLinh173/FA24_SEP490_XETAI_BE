const Rating = require("../model/ratingModel");
const User = require("../model/userModel");
const Driver = require("../model/driverModel");

class RatingController {
  async addRating(req, res) {
    const { userId, reviewerId, value, comment } = req.body;
    const { postId } = req.params;

    if (value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    try {
      // Tìm User
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại" });
      }

      // Tìm Driver dựa trên userId
      const driver = await Driver.findOne({ userId });
      if (!driver) {
        return res.status(404).json({ message: "Tài xế không tồn tại" });
      }

      // Kiểm tra xem người đánh giá đã đánh giá tài xế này cho bài đăng này chưa
      const existingRating = await Rating.findOne({
        userId,
        reviewerId,
        postId,
      });
      if (existingRating) {
        return res.status(400).json({
          message:
            "Bạn đã đánh giá tài xế cho bài đăng này. Vui lòng sử dụng updateRating để sửa đánh giá.",
        });
      }

      // Thêm đánh giá mới
      const rating = new Rating({ userId, reviewerId, postId, value, comment });
      await rating.save();

      // Tính lại averageRating cho User
      const userRatings = await Rating.find({ userId });
      const totalUserRating = userRatings.reduce((acc, r) => acc + r.value, 0);
      const averageUserRating = totalUserRating / userRatings.length;

      // Tính lại averageRating cho Driver
      const driverRatings = await Rating.find({ userId });
      const totalDriverRating = driverRatings.reduce(
        (acc, r) => acc + r.value,
        0
      );
      const averageDriverRating = totalDriverRating / driverRatings.length;

      // Cập nhật averageRating cho cả User và Driver
      await User.findByIdAndUpdate(userId, {
        averageRating: averageUserRating,
      });
      await Driver.findOneAndUpdate(
        { userId },
        { averageRating: averageDriverRating }
      );

      return res.json({ message: "Thêm đánh giá thành công", rating });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi thêm đánh giá", error: err });
    }
  }

  // Update rating
  async updateRating(req, res) {
    const { userId, reviewerId, value, comment } = req.body;

    // Kiểm tra rating hợp lệ
    if (value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: "Rating phải nằm trong khoảng từ 1 đến 5" });
    }

    try {
      // Tìm đánh giá đã tồn tại của reviewer cho userId
      const existingRating = await Rating.findOne({ userId, reviewerId });

      if (!existingRating) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá. Hãy sử dụng addRating để tạo mới.",
        });
      }

      // Cập nhật giá trị rating và comment
      existingRating.value = value || existingRating.value;
      existingRating.comment = comment || existingRating.comment;

      // Lưu lại đánh giá đã cập nhật
      const updatedRating = await existingRating.save();

      // Cập nhật lại averageRating cho User hoặc Driver
      const user = await User.findById(userId);
      const driver = await Driver.findOne({ userId });

      const userRatings = await Rating.find({ userId });
      const totalRating = userRatings.reduce((acc, r) => acc + r.value, 0);
      const averageRating = totalRating / userRatings.length;

      // Cập nhật averageRating trong bảng User hoặc Driver
      if (user) {
        await User.findByIdAndUpdate(userId, { averageRating });
      }
      if (driver) {
        await Driver.findOneAndUpdate({ userId }, { averageRating });
      }

      return res
        .status(200)
        .json({ message: "Cập nhật đánh giá thành công", updatedRating });
    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi cập nhật đánh giá", error: err });
    }
  }
  async getRatingsByPost(req, res) {
    const { postId } = req.params;

    try {
      // Tìm tất cả đánh giá của bài post theo postId
      const ratings = await Rating.find({ postId })
        .populate("reviewerId", "fullName email") // Lấy thông tin người đánh giá
        .populate("userId", "fullName email") // Lấy thông tin người được đánh giá
        .exec();

      if (ratings.length === 0) {
        return res
          .status(404)
          .json({ message: "Không có đánh giá nào cho bài đăng này." });
      }

      return res.json({
        message: "Lấy đánh giá cho bài đăng thành công",
        ratings,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy đánh giá", error: err });
    }
  }
  async getMyRatings(req, res) {
    const userId = req.params.userId;

    try {
      // Tìm đánh giá có userId là của tài xế
      const ratings = await Rating.find({ userId }).populate(
        "reviewerId",
        "fullName"
      );

      if (ratings.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá nào" });
      }

      return res.json({ message: "Danh sách đánh giá của tài xế", ratings });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy đánh giá của tài xế", error: err });
    }
  }
  // Get ratings given by a user
  async getRatingsGivenByUser(req, res) {
    const reviewerId = req.params.reviewerId;

    try {
      // Tìm tất cả đánh giá do người dùng này (reviewerId) thực hiện
      const ratings = await Rating.find({ reviewerId }).populate(
        "userId",
        "fullName"
      );

      return res.json({
        message: "Lấy đánh giá đã thực hiện thành công",
        ratings,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy đánh giá đã thực hiện", error: err });
    }
  }

  async getRatingByReviewerForUser(req, res) {
    const { reviewerId, userId } = req.query;
    try {
      const rating = await Rating.findOne({ reviewerId, userId })
        .populate("userId")
        .populate("reviewerId");

      if (!rating) {
        return res.status(404).json({
          message: "Không tìm thấy đánh giá của người dùng này cho tài xế này",
        });
      }

      return res.json({ message: "Lấy đánh giá thành công", rating });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy đánh giá", error: err });
    }
  }
}

module.exports = new RatingController();
