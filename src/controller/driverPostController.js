const DriverPost = require("../model/driverPost");
const cloudinary = require("../config/cloudinaryConfig");
const Transaction = require("../model/transactionModel");
const User = require("../model/userModel");
// Tạo driver post mới
const createDriverPost = async (req, res) => {
  const { creatorId, startCity, destinationCity, description } = req.body;
  const images = req.files;
  const postFee = 5000;
  const generateOrderCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const missingFields = [];
  if (!creatorId) missingFields.push("creatorId");
  if (!startCity) missingFields.push("startCity");
  if (!destinationCity) missingFields.push("destinationCity");
  if (!description) missingFields.push("description");
  if (!images) missingFields.push("images");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    // Upload hình ảnh lên Cloudinary
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

    // Tạo driver post mới
    const newDriverPost = new DriverPost({
      creatorId,
      startCity,
      destinationCity,
      description,
      images: imageUrls,
    });

    // Lưu bài đăng mới và populate creatorId để trả về đầy đủ thông tin
    const savedDriverPost = await newDriverPost.save();
    const populatedDriverPost = await DriverPost.findById(
      savedDriverPost._id
    ).populate({
      path: "creatorId",
      populate: { path: "userId" },
    });

    const userId = populatedDriverPost.creatorId?.userId?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (user.balance < postFee) {
      return res.status(402).json({
        message: "Số dư không đủ để đăng bài. Vui lòng nạp thêm tiền.",
      });
    }

    user.balance -= postFee;
    await user.save();

    const newTransaction = new Transaction({
      userId: userId,
      postId: savedDriverPost._id,
      amount: postFee,
      type: "POST_PAYMENT",
      status: "PAID",
      orderCode: generateOrderCode(),
    });
    await newTransaction.save();
    res.status(200).json(populatedDriverPost);
  } catch (error) {
    res.status(400).json({ message: "Unable to create driver post", error });
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
  const { creatorId } = req.params;

  try {
    const driverPost = await DriverPost.find(creatorId);
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
  const { startCity, destinationCity, description } = req.body;
  const images = req.files;

  try {
    const currentPost = await DriverPost.findById(id);
    if (!currentPost) {
      return res.status(404).json({ message: "Driver post not found" });
    }

    // Xóa ảnh cũ trên Cloudinary (nếu có)
    // if (currentPost.images && currentPost.images.length > 0) {
    //   const deletePromises = currentPost.images.map((imageUrl) => {
    //     const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]; // Lấy publicId từ URL
    //     return cloudinary.uploader.destroy(`driver_post_images/${publicId}`);
    //   });
    //   await Promise.all(deletePromises);
    // }

    let imageUrls = [];

    // Tải lên ảnh mới lên Cloudinary
    if (images && images.length > 0) {
      const uploadPromises = images.map((file) => {
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
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // Cập nhật bài đăng với danh sách ảnh mới
    const updatedDriverPost = await DriverPost.findByIdAndUpdate(
      id,
      {
        startCity,
        destinationCity,
        description,
        images: imageUrls, // Thay thế danh sách ảnh
      },
      { new: true }
    ).populate({
      path: "creatorId",
      populate: { path: "userId" },
    });

    res.status(200).json(updatedDriverPost);
  } catch (error) {
    res.status(400).json({ message: "Unable to update driver post", error });
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
