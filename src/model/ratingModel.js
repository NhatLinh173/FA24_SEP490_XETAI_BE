const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Mã của người đánh giá
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Mã của người được đánh giá
    required: true
  },
  comment: {
    type: String, // Bình luận của người đánh giá
    default: ''
  }
}, {
  timestamps: true  // Tự động thêm createdAt và updatedAt
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;
