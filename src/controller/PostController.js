const Post = require("../model/postModel");
const Deal = require("../model/dealPriceModel");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");
const Comment = require("../model/postModel");
const Category = require("../model/categoryModel");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinaryConfig");
const dealPriceModel = require("../model/dealPriceModel");

const ObjectId = mongoose.Types.ObjectId;

class PostController {
  async createPost(req, res) {
    try {
      const salePostDataBody = req.body;
      const images = req.files;
      const { creator } = salePostDataBody;
      const postFee = 2000;

      if (!salePostDataBody || !images) {
        return res.status(400).json({ message: "Thông tin không hợp lệ." });
      }

      const user = await User.findById(creator);
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

      let imageUrls = [];
      if (images && images.length > 0) {
        const uploadImagePromises = images.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "post_images" }, (error, result) => {
                if (error) {
                  reject(new Error("Lỗi khi tải ảnh lên Cloudinary: " + error.message));
                } else {
                  resolve(result.secure_url);
                }
              })
              .end(file.buffer);
          });
        });
        imageUrls = await Promise.all(uploadImagePromises);
      }

      const newPost = new Post({
        ...salePostDataBody,
        images: imageUrls,
      });

      const savedPost = await newPost.save();

      const newTransaction = new Transaction({
        userId: creator,
        postId: savedPost._id,
        amount: postFee,
        type: "POST_PAYMENT",
        status: "PAID",
      });
      await newTransaction.save();

      res.status(201).json({ message: "Đăng bài thành công", post: savedPost });
    } catch (err) {
      res.status(400).json({
        message: "Đã xảy ra lỗi trong quá trình đăng bài.",
        error: err.message,
      });
    }
  }

  async updatePost(req, res, next) {
    try {
      const id = req.params.idPost;
      const bodyData = req.body;
      const newImages = req.files;
      const oldImages = bodyData.oldImages || [];

      const updatePost = await Post.findOne({ _id: id });
      if (!updatePost) {
        return res.status(404).json({ message: "Post not found" });
      }

      let imageUrls = Array.isArray(oldImages) ? [...oldImages] : [oldImages];
      if (typeof oldImages === "string") {
        imageUrls = oldImages.split(",").map((url) => url.trim());
      }

      if (newImages && newImages.length > 0) {
        const uploadImagePromises = newImages.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "post_images" }, (error, result) => {
                if (error) {
                  reject(new Error("Error uploading image to Cloudinary: " + error.message));
                } else {
                  resolve(result.secure_url);
                }
              })
              .end(file.buffer);
          });
        });

        const newImageUrls = await Promise.all(uploadImagePromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      updatePost.title = bodyData.title;
      updatePost.detail = bodyData.detail;
      updatePost.images = imageUrls;
      updatePost.load = bodyData.load;
      updatePost.fullname = bodyData.fullname;
      updatePost.email = bodyData.email;
      updatePost.phone = bodyData.phone;
      updatePost.startPoint = bodyData.startPoint;
      updatePost.destination = bodyData.destination;
      updatePost.category = bodyData.category;
      updatePost.price = bodyData.price;
      updatePost.status = bodyData.status;
      updatePost.deliveryTime = bodyData.deliveryTime;
      updatePost.startPointCity = bodyData.startPointCity;
      updatePost.destinationCity = bodyData.destinationCity;

      const currentTime = new Date();
      if (bodyData.status === "inprogress") {
        updatePost.startTime = currentTime;
      } else if (bodyData.status === "finish") {
        updatePost.endTime = currentTime;
      }

      const savedPost = await updatePost.save();
      return res.json(savedPost);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: error.message,
        });
      }
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async showPostByUserId(req, res, next) {
    const userId = req.params.idUser;
    var page = req.query.page || 1;
    var limitPage = 8;
    var totalPosts = await Post.countDocuments({ creator: userId });
    var maxPage = Math.ceil(totalPosts / limitPage);

    await Post.find({ creator: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limitPage)
      .limit(limitPage)
      .populate({
        path: "creator",
        select: "firstName lastName",
      })
      .then((salePosts) => {
        res.json({
          salePosts: salePosts,
          maxPage: maxPage,
        });
      })
      .catch((err) => {
        res.json(err);
      });
  }

  async showPostByDriverId(req, res, next) {
    try {
      const { driverId } = req.params;
      if (driverId === "undefined") {
        return res.status(400).json({
          message: "Driver undefined",
          status: 400,
        });
      }
      const deals = await Deal.find({ driverId }).select("postId");
      const postIds = deals.map((deal) => deal.postId);
      const posts = await Post.find({ _id: { $in: postIds } })
        .populate("creator", "_id email phone fullName avatar")
        .populate("dealId");
      if (posts.length === 0) {
        return res.status(404).json({
          message: "No posts found for this driver",
          status: 404,
          data: [],
        });
      }

      return res.status(200).json({
        message: "Posts retrieved successfully",
        status: 200,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching posts by driver:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        status: 500,
        error: error.message,
      });
    }
  }

  async showPost(req, res, next) {
    var page = parseInt(req.query.page) || 1;
    var limitPage = 9;

    try {
      // Đếm tổng số đơn hàng
      var totalPosts = await Post.countDocuments({ status: "wait" });
      var maxPage = Math.ceil(totalPosts / limitPage);

      // Lấy danh sách đơn hàng với phân trang
      var salePosts = await Post.find({ status: "wait" }) // Lấy tất cả đơn hàng
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo
        .populate({
          path: "creator",
          select: "firstName lastName",
        })
        .skip((page - 1) * limitPage) // Bỏ qua các đơn hàng đã được hiển thị
        .limit(limitPage); // Giới hạn số đơn hàng trên mỗi trang

      res.status(200).json({
        salePosts: salePosts,
        totalPosts: totalPosts,
        maxPage: maxPage, // Trả về tổng số trang
        currentPage: page, // Trả về trang hiện tại
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching posts",
        error: err,
      });
    }
  }

  async getOne(req, res, next) {
    const id = req.params.idPost;
    try {
      const salePost = await Post.findOne({ _id: id })
        .populate({
          path: "dealId",
          populate: {
            path: "driverId",
            model: "Driver",
            populate: {
              path: "userId",
              model: "User",
              select: "firstName lastName email",
            },
          },
        })
        .populate({
          path: "creator",
          select: "email phone fullName",
        });

      if (!salePost) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(salePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getBaseOnCategory(req, res, next) {
    const slugId = req.params.idslug;
    console.log(slugId);
    try {
      const category = await Category.find({
        _id: slugId,
        isLock: false,
        isFinish: false,
      });

      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limitPage = 8;

      const totalPosts = await Post.countDocuments({ category: slugId });
      const maxPage = Math.ceil(totalPosts / limitPage);

      const salePosts = await Post.find({ category: slugId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limitPage)
        .limit(limitPage)
        .populate({
          path: "creator",
          select: "username fullname",
        });

      res.json({ salePosts: salePosts, maxPage: maxPage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addComment(req, res, next) {
    const newComment = req.body;
    const id = req.params.idPost;
    await Post.findOne({ _id: id })
      .then((salePost) => {
        if (salePost) {
          salePost.comments.push({
            detail: newComment.detail,
            userComment: newComment.userComment,
          });
          salePost
            .save()
            .then((salePost) => {
              res.json(salePost);
            })
            .catch((err) => {
              res.json(err);
            });
        } else res.json("not found");
      })
      .catch((err) => res.json(err));
  }

  async deletePost(req, res, next) {
    const id = req.params.idPost;
    await Post.deleteOne({ _id: id })
      .then((salePost) => {
        res.json(salePost);
      })
      .catch((error) => {
        res.status(400).json({
          message: "Validation error",
          error: error.message,
        });
      });
  }

  async getRelated(req, res, next) {
    const cateId = req.params.idCategory;

    await Post.aggregate([
      {
        $match: {
          category: ObjectId(cateId),
          isLock: false,
          isFinish: false,
        },
      },
      { $sample: { size: 5 } },
    ])
      .then((salePosts) => {
        res.json(salePosts);
      })
      .catch((error) => {
        res.json({
          error: error,
        });
      });
  }

  async showPostByUserIdAndStatus(req, res, next) {
    const userId = req.params.idUser;
    const status = req.query.status;
    var page = req.query.page || 1;
    var limitPage = 8;

    try {
      var totalPosts = await Post.countDocuments({
        creator: userId,
        status: status,
      });
      var maxPage = Math.ceil(totalPosts / limitPage);

      const posts = await Post.find({ creator: userId, status: status })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limitPage)
        .limit(limitPage)
        .populate({
          path: "creator",
          select: "firstName lastName",
        });

      if (posts.length === 0) {
        return res.status(404).json({ message: "Không có bài viết nào" });
      }

      res.json({
        salePosts: posts,
        maxPage: maxPage,
      });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi tìm bài viết",
        error: err,
      });
    }
  }

  async showHistory(req, res, next) {
    try {
      const salePosts = await Post.find({
        isLock: false,
        isFinish: false,
        status: { $in: ["inprogress", "finish"] },
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "creator",
          select: "firstName lastName",
        });

      res.status(200).json({
        salePosts: salePosts,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error fetching posts",
        error: err,
      });
    }
  }

  async setTimes(req, res, next) {
    const id = req.params.idPost;
    const { startTime, endTime } = req.body;

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(400).json({ message: "Post not found" });
      }
      post.startTime = startTime;
      post.endTime = endTime;

      const updatePost = await post.save();
      res.status(200).json({ updatePost: updatePost });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateDealId(req, res) {
    const { postId } = req.params;
    const { status, driverId, deliveryTime, dealPrice } = req.body;

    if (!postId || !status || !deliveryTime || !dealPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const currentDate = new Date();
      const inputDate = new Date(deliveryTime);

      if (inputDate <= currentDate) {
        return res.status(400).json({ message: "Invalid delivery time" });
      }

      const newDeal = new dealPriceModel({
        postId: postId,
        status: status,
        driverId: driverId,
        dealPrice: dealPrice,
        estimatedTime: deliveryTime,
      });

      await newDeal.save();

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { status: status, dealId: newDeal._id, deliverTime: deliveryTime },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ message: "Status updated successfully", post: updatedPost });
    } catch (error) {
      console.error("Error saving new deal:", error);
      res.status(500).json({ message: "Error updating status", error });
    }
  }
}

module.exports = new PostController();
