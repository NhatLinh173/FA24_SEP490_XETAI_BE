const User = require("../model/userModel")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class RatingController {

    async addRating(req, res, next) {
        const { userId, rating, reviewerId, comment } = req.body;

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
            user.ratings.push({
                value: rating,
                reviewerId,
                comment: comment || ''  // Nếu không có comment thì mặc định là chuỗi rỗng
            });

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
        const { userId, rating, reviewerId, comment } = req.body;

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

            if (!existingRating) {
                // Nếu chưa có đánh giá trước đó, trả về thông báo lỗi
                return res.status(400).json({ message: 'Rating not found. Use addRating to create a new rating.' });
            }

            // Cập nhật giá trị của rating và comment
            existingRating.value = rating;
            existingRating.comment = comment || existingRating.comment;  // Nếu không có comment mới, giữ nguyên comment cũ

            // Tính lại rating trung bình
            const totalRating = user.ratings.reduce((acc, r) => acc + r.value, 0);
            user.averageRating = totalRating / user.ratings.length;

            // Lưu lại user sau khi cập nhật
            const updatedUser = await user.save();
            return res.json({ message: 'Rating updated successfully', user: updatedUser });
        } catch (err) {
            return res.status(500).json({ message: 'Error updating rating', error: err });
        }
    }
}
module.exports = new RatingController();