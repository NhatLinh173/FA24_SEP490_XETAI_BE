const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const {createBlogController,
  getAllBlogsController,
  getBlogByIdController,
  updateBlogController,
  deleteBlogController,} = require('../controller/blogController');

// Create a new blog
router.post('/', upload.single('image'), createBlogController);

// Get all blogs
router.get('/', getAllBlogsController);

// Get a blog by ID
router.get('/:id', getBlogByIdController);

// Update a blog by ID
router.put('/:id', upload.single('image'), updateBlogController);

// Delete a blog by ID
router.delete('/:id', deleteBlogController);

module.exports = router;

