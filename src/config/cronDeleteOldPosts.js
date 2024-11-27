const Post = require("../model/postModel"); // Đường dẫn tới model Post

// Hàm xóa bài viết cũ
const deleteOldPosts = async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  try {
    const result = await Post.deleteMany({
      status: "wait",
      createdAt: { $lte: threeDaysAgo },
    });
    console.log(`Deleted ${result.deletedCount} old posts.`);
  } catch (err) {
    console.error("Error deleting old posts:", err);
    throw err; // Nếu cần, bạn có thể ném lỗi ra để xử lý ở nơi gọi hàm
  }
};

module.exports = deleteOldPosts;
