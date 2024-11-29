const Post = require("../model/postModel");

const deleteOldPosts = async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  try {
    const result = await Post.deleteMany({
      status: "wait",
      createdAt: { $lte: threeDaysAgo },
    });
  } catch (err) {
    console.error("Error deleting old posts:", err);
    throw err;
  }
};

module.exports = deleteOldPosts;
