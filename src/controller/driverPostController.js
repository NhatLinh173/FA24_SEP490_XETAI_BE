const DriverPost = require("../model/driverPost");
const cloudinary = require("../config/cloudinaryConfig");
const Transaction = require("../model/transactionModel");
const User = require("../model/userModel");
// Tạo driver post mới
const createDriverPost = async (req, res) => {
  try {
    const { creatorId, startCity, destinationCity, description } = req.body;
    const images = req.files;
    const postFee = 5000;

    // Validate required fields
    const missingFields = [];
    if (!creatorId) missingFields.push("creatorId");
    if (!startCity) missingFields.push("startCity");
    if (!destinationCity) missingFields.push("destinationCity");
    if (!description) missingFields.push("description");
    if (!images || images.length === 0) missingFields.push("images");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing fields: ${missingFields.join(", ")}`,
      });
    }

    // Check user existence and balance
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (creator.balance < postFee) {
      return res.status(402).json({
        message: "Số dư không đủ để đăng bài. Vui lòng nạp thêm tiền.",
        requiredBalance: postFee,
        currentBalance: creator.balance,
      });
    }

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      images.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "driver_post_images" },
              (error, result) => {
                if (error) {
                  reject(
                    new Error(
                      "Error uploading image to Cloudinary: " + error.message
                    )
                  );
                } else {
                  resolve(result.secure_url);
                }
              }
            )
            .end(file.buffer);
        });
      })
    );

    // Create new driver post
    const newDriverPost = new DriverPost({
      creatorId,
      startCity,
      destinationCity,
      description,
      images: imageUrls,
      status: "PENDING", // Add default status if needed
    });

    // Save the post
    const savedDriverPost = await newDriverPost.save();

    // Deduct balance and save user
    creator.balance -= postFee;
    await creator.save();

    // Create transaction record
    const newTransaction = new Transaction({
      userId: creatorId,
      postId: savedDriverPost._id,
      amount: postFee,
      type: "POST_PAYMENT",
      status: "PAID",
      orderCode: Math.floor(100000 + Math.random() * 900000).toString(),
    });
    await newTransaction.save();

    // Get populated post data
    const populatedDriverPost = await DriverPost.findById(
      savedDriverPost._id
    ).populate({
      path: "creatorId",
      populate: { path: "userId" },
    });

    // Return success response
    res.status(200).json({
      message: "Tạo bài đăng thành công",
      data: populatedDriverPost,
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error in createDriverPost:", error);
    res.status(500).json({
      message: "Không thể tạo bài đăng",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Lấy tất cả driver posts
const getAllDriverPosts = async (req, res) => {
  try {
    const driverPosts = await DriverPost.find().populate({
      path: "creatorId",
      populate: { path: "userId" },
    });
    res.status(200).json(driverPosts);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch driver posts", error });
  }
};

// Lấy driver post theo ID
const getDriverPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const driverPost = await DriverPost.findById(id);
    if (!driverPost) {
      return res.status(404).json({ message: "Driver post not found" });
    }

    res.status(200).json(driverPost);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch driver post", error });
  }
};

// Cập nhật driver post
const updateDriverPost = async (req, res) => {
  const { id } = req.params;
  const { startCity, destinationCity, description, existingImages } = req.body;
  const images = req.files;

  try {
    const currentPost = await DriverPost.findById(id);
    if (!currentPost) {
      return res.status(404).json({ message: "Driver post not found" });
    }

    let imageUrls = [];

    // Giữ lại các ảnh cũ từ existingImages
    if (existingImages) {
      // Nếu existingImages là string, parse nó
      const existingImagesArray =
        typeof existingImages === "string"
          ? JSON.parse(existingImages)
          : existingImages;
      imageUrls = [...existingImagesArray];
    }

    // Tải lên và thêm ảnh mới (nếu có)
    if (images && images.length > 0) {
      const uploadPromises = images.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "driver_post_images" },
              (error, result) => {
                if (error)
                  reject(new Error("Error uploading image: " + error.message));
                else resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        });
      });

      const newImageUrls = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...newImageUrls]; // Kết hợp ảnh cũ và mới
    }

    // Cập nhật bài đăng với danh sách ảnh đã kết hợp
    const updatedDriverPost = await DriverPost.findByIdAndUpdate(
      id,
      {
        startCity,
        destinationCity,
        description,
        images: imageUrls,
      },
      { new: true }
    ).populate({
      path: "creatorId",
      populate: { path: "userId" },
    });

    res.status(200).json(updatedDriverPost);
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(400)
      .json({ message: "Unable to update driver post", error: error.message });
  }
};

// Xóa driver post
const deleteDriverPost = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const deletedDriverPost = await DriverPost.findByIdAndDelete(id);

    if (!deletedDriverPost) {
      return res.status(404).json({ message: "Driver post not found" });
    }

    res.status(200).json({ message: "Driver post deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Unable to delete driver post", error });
  }
};

// Lấy driver posts theo creatorId
const getDriverPostsByCreatorId = async (req, res) => {
  const { creatorId } = req.params;

  try {
    // Tìm tất cả bài đăng dựa trên creatorId và populate để có đầy đủ thông tin
    const driverPosts = await DriverPost.find({ creatorId }).populate({
      path: "creatorId",
      populate: { path: "userId" },
    });

    if (driverPosts.length === 0) {
      return res
        .status(404)
        .json({ message: "No driver posts found for this creatorId" });
    }

    res.status(200).json(driverPosts);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Unable to fetch driver posts by creatorId", error });
  }
};

const updateDriverPostStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const driverPost = await DriverPost.findById(id);
    if (!driverPost) {
      const response = { status: 404, message: "Driver post not found" };
      if (res) res.status(404).json(response);
      return response;
    }

    driverPost.status = status;

    await driverPost.save();

    const response = {
      status: 200,
      message: "Driver post status updated successfully",
      driverPost,
    };
    if (res) res.status(200).json(response);
    return response;
  } catch (error) {
    const response = {
      status: 500,
      message: "Error updating driver post status",
      error: error.message,
    };
    if (res) res.status(500).json(response);
    return response;
  }
};

module.exports = {
  createDriverPost,
  getAllDriverPosts,
  getDriverPostById,
  updateDriverPost,
  deleteDriverPost,
  getDriverPostsByCreatorId,
  updateDriverPostStatus,
};
