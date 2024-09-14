const User = require("../model/userModel")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class RatingController {

    async addRating(req, res, next) {
        const { userId, rating, reviewerId } = req.body;

        // Kiểm tra rating phải nằm trong khoảng hợp lệ (1-5)
        if (rating < 1 || rating > 5) {
            res.status(400);
            return res.json({ message: 'Rating must be between 1 and 5' });
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Kiểm tra nếu reviewer đã đánh giá trước đó
            const existingRating = user.ratings.find(r => r.reviewerId.toString() === reviewerId);

            if (existingRating) {
                // Nếu đã đánh giá trước đó, trả về thông báo lỗi
                return res.status(400).json({ message: 'You have already rated this user. Use updateRating to change your rating.' });
            }

            // Nếu chưa có đánh giá từ reviewer, thêm đánh giá mới
            user.ratings.push({ value: rating, reviewerId });

            // Tính lại rating trung bình
            const totalRating = user.ratings.reduce((acc, r) => acc + r.value, 0);
            user.averageRating = totalRating / user.ratings.length;

            // Lưu lại user với đánh giá mới
            const savedUser = await user.save();
            return res.json({ message: 'Rating added successfully', user: savedUser });
        } catch (err) {
            return res.status(500).json({ message: 'Error processing rating', error: err });
        }
    }

    // Cập nhật đánh giá (rating) của một reviewer đã tồn tại
    async updateRating(req, res, next) {
        const { userId, newRating, reviewerId } = req.body;

        // Kiểm tra xem rating mới có nằm trong khoảng 1-5 không
        if (newRating < 1 || newRating > 5) {
            res.status(400);
            return res.json({ message: 'Rating must be between 1 and 5' });
        }

        await User.findById(userId)
            .then(user => {
                if (!user) {
                    res.status(404);
                    return res.json({ message: 'User not found' });
                }

                // Tìm và cập nhật đánh giá của reviewer
                const ratingIndex = user.ratings.findIndex(r => r.reviewerId.toString() === reviewerId);
                if (ratingIndex === -1) {
                    res.status(404);
                    return res.json({ message: 'Rating not found for this reviewer' });
                }

                // Cập nhật rating
                user.ratings[ratingIndex].value = newRating;

                // Tính lại rating trung bình
                const totalRating = user.ratings.reduce((acc, r) => acc + r.value, 0);
                user.averageRating = totalRating / user.ratings.length;

                return user.save();
            })
            .then(updatedUser => res.json({ message: 'Rating updated successfully', user: updatedUser }))
            .catch(err => res.status(500).json({ message: 'Error updating rating', error: err }));
    }
}
module.exports = new RatingController();