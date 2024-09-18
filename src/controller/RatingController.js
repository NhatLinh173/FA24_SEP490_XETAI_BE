const Rating = require('../model/ratingModel');
const User = require('../model/userModel');

class RatingController {

    async addRating(req, res) {
        const { userId, reviewerId, value, comment } = req.body;

        if (value < 1 || value > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const existingRating = await Rating.findOne({ userId, reviewerId });
            if (existingRating) {
                return res.status(400).json({ message: 'You have already rated this user. Use updateRating to modify your rating.' });
            }

            const rating = new Rating({ userId, reviewerId, value, comment });
            await rating.save();

            // Tính lại averageRating cho người dùng
            const ratings = await Rating.find({ userId });
            const totalRating = ratings.reduce((acc, r) => acc + r.value, 0);
            const averageRating = totalRating / ratings.length;

            await User.findByIdAndUpdate(userId, { averageRating });

            return res.json({ message: 'Rating added successfully', rating });
        } catch (err) {
            return res.status(500).json({ message: 'Error adding rating', error: err });
        }
    }

    async updateRating(req, res, next) {
        const { userId, reviewerId, rating, comment } = req.body;
    
        // Kiểm tra rating hợp lệ
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
    
        try {
          // Tìm đánh giá đã tồn tại của reviewer cho userId
          const existingRating = await Rating.findOne({ userId, reviewerId });
    
          if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found. Use addRating to create a new rating.' });
          }
    
          // Cập nhật giá trị rating và comment
          existingRating.value = rating;
          existingRating.comment = comment || existingRating.comment;
    
          // Lưu lại đánh giá đã cập nhật
          const updatedRating = await existingRating.save();
    
          // Cập nhật lại averageRating cho User
          const userRatings = await Rating.find({ userId });
          const totalRating = userRatings.reduce((acc, r) => acc + r.value, 0);
          const averageRating = totalRating / userRatings.length;
    
          // Cập nhật averageRating trong bảng User
          await User.findByIdAndUpdate(userId, { averageRating });
    
          return res.status(200).json({ message: 'Rating updated successfully', updatedRating });
        } catch (err) {
          console.error('Error updating rating:', err);
          return res.status(500).json({ message: 'Error updating rating', error: err });
        }
      }
    
    

    async getMyRatings(req, res) {
        const userId = req.params.userId;

        try {
            const ratings = await Rating.find({ userId }).populate('reviewerId', 'fullName');
            return res.json({ message: 'Ratings received by you', ratings });
        } catch (err) {
            return res.status(500).json({ message: 'Error retrieving ratings', error: err });
        }
    }

    async getRatingsGivenByMe(req, res) {
        const reviewerId = req.params.reviewerId;

        try {
            const ratings = await Rating.find({ reviewerId }).populate('userId', 'fullName');
            return res.json({ message: 'Ratings given by you', ratings });
        } catch (err) {
            return res.status(500).json({ message: 'Error retrieving ratings', error: err });
        }
    }
}

module.exports = new RatingController();
