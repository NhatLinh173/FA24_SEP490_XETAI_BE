const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../service/blogService");
const cloudinary = require("../config/cloudinaryConfig");

const createBlogController = async (req, res) => {
  try {
    const { creatorId, title, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "blog_images" }, (error, result) => {
          if (error) {
            reject(
              new Error("Error uploading image to Cloudinary: " + error.message)
            );
          } else {
            resolve(result.secure_url);
          }
        })
        .end(image.buffer);
    });

    const newBlog = {
      creatorId,
      title,
      description,
      image: imageUrl,
    };

    const savedBlog = await createBlog(newBlog);

    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogByIdController = async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file;

    let imageUrl;

    if (image) {
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "blog_images" }, (error, result) => {
            if (error) {
              reject(
                new Error(
                  "Error uploading image to Cloudinary: " + error.message
                )
              );
            } else {
              resolve(result.secure_url);
            }
          })
          .end(image.buffer);
      });
    }

    const updatedBlog = await updateBlog(req.params.id, {
      title,
      description,
      ...(imageUrl && { image: imageUrl }),
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBlogController = async (req, res) => {
  try {
    const deletedBlog = await deleteBlog(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBlogController,
  getAllBlogsController,
  getBlogByIdController,
  updateBlogController,
  deleteBlogController,
};
