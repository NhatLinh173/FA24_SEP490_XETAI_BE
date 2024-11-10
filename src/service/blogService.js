const Blog = require("../model/blogModel.js");

const createBlog = async (blogData) => {
  const newBlog = new Blog(blogData);
  return await newBlog.save();
};

const getAllBlogs = async () => {
  return await Blog.find().populate("creatorId", "fullName");
};

const getBlogById = async (blogId) => {
  return await Blog.findById(blogId).populate("creatorId", "fullName");
};

const updateBlog = async (blogId, blogData) => {
  return await Blog.findByIdAndUpdate(blogId, blogData, { new: true });
};

const deleteBlog = async (blogId) => {
  return await Blog.findByIdAndDelete(blogId);
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
