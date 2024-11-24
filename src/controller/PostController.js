const Post = require("../model/postModel");
const Deal = require("../model/dealPriceModel");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");
const Comment = require("../model/postModel");
const Category = require("../model/categoryModel");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinaryConfig");
const dealPriceModel = require("../model/dealPriceModel");
const Driver = require("../model/driverModel");
const { sendEmail } = require("../service/emailService");
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
                  reject(
                    new Error(
                      "Lỗi khi tải ảnh lên Cloudinary: " + error.message
                    )
                  );
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
      const generateOrderCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };
      const newTransaction = new Transaction({
        userId: creator,
        postId: savedPost._id,
        amount: postFee,
        type: "POST_PAYMENT",
        status: "PAID",
        orderCode: generateOrderCode(),
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
    console.log("alooo:");
    try {
      const id = req.params.idPost;
      const bodyData = req.body;
      const newImages = req.files;
      const oldImages = bodyData.oldImages || [];

      const updatePost = await Post.findOne({ _id: id });
      if (!updatePost) {
        return res.status(404).json({ message: "Post not found" });
      }
      const currentStatus = updatePost.status;
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
                  reject(
                    new Error(
                      "Error uploading image to Cloudinary: " + error.message
                    )
                  );
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
      updatePost.paymentMethod = bodyData.paymentMethod;

      const currentTime = new Date();
      if (bodyData.status === "inprogress") {
        updatePost.startTime = currentTime;
      } else if (bodyData.status === "finish") {
        updatePost.endTime = currentTime;
      } else if (bodyData.status === "cancel") {
        const user = await User.findById({ _id: bodyData.creator });
        const price = parseFloat(
          bodyData.price.replace(/,/g, "").replace(/\./g, "")
        );
        const generateOrderCode = () => {
          return Math.floor(100000 + Math.random() * 900000).toString();
        };
        if (currentStatus === "approve") {
          const cancellationFee = price * 0.8;
          if (user) {
            if (user.balance < cancellationFee) {
              return res
                .status(402)
                .json({ message: "Không đủ số dư để hủy đơn hàng" });
            } else {
              user.balance -= cancellationFee;
              const newTransaction = new Transaction({
                userId: bodyData.creator,
                postId: updatePost._id,
                orderCode: generateOrderCode(),
                amount: cancellationFee,
                type: "CANCEL_ORDER",
                status: "PAID",
              });

              await newTransaction.save();
              await user.save();
            }
          }
        }
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
      .populate({
        path: "creator",
        select: "_id email phone fullName avatar",
      })
      .populate({
        path: "dealId",
        populate: {
          path: "driverId",
          populate: {
            path: "userId",
          },
        },
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
      var salePosts = await Post.find({ status: "wait", isLock: false }) // Lấy tất cả đơn hàng
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
            populate: {
              path: "userId",
              select: "email phone fullName avatar",
            },
          },
        })
        .populate({
          path: "creator",
          select: "email phone fullName avatar",
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
      const driver = await Driver.findById(driverId);
      if (
        !driver ||
        !driver.carRegistrations ||
        driver.carRegistrations.length === 0
      ) {
        return res
          .status(422)
          .json({ message: "Driver must have a car registration" });
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

      res
        .status(200)
        .json({ message: "Status updated successfully", post: updatedPost });
    } catch (error) {
      console.error("Error saving new deal:", error);
      res.status(500).json({ message: "Error updating status", error });
    }
  }

  async completeOrder(req, res) {
    try {
      const { postId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const post = await Post.findById(postId).populate("dealId");

      if (!post) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
      }

      if (post.status !== "finish") {
        return res.status(400).json({
          code: "ORDER_NOT_CONFIRMED",
          message: "Đơn hàng chưa được tài xế xác nhận giao hàng.",
        });
      }

      if (post.userConfirmed) {
        return res.status(400).json({
          code: "ORDER_ALREADY_CONFIRMED",
          message: "Đơn hàng đã được xác nhận hoàn tất từ phía người dùng.",
        });
      }

      post.userConfirmed = true;

      if (post.paymentMethod === "bank_transfer") {
        const transportFee = parseFloat(post.price.replace(/,/g, ""));
        const driverId = post.dealId.driverId;
        const driver = await Driver.findById(driverId).populate("userId");
        const customer = await User.findById(post.creator);
        if (!driver) {
          return res.status(404).json({ message: "Tài xế không tồn tại." });
        }

        if (!customer) {
          return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        if (customer.balance < transportFee) {
          return res.status(400).json({
            code: "INSUFFICIENT_BALANCE",
            message: "Số dư người dùng không đủ.",
          });
        }
        customer.balance -= transportFee;
        await customer.save();

        const driverUser = await User.findById(driver.userId);

        if (!driverUser) {
          return res
            .status(404)
            .json({ message: "Người dùng tài xế không tồn tại." });
        }

        const driverAmount = transportFee * 0.95;
        driverUser.balance += driverAmount;
        await driverUser.save();

        const generateOrderCode = () => {
          return Math.floor(100000 + Math.random() * 900000).toString();
        };

        const customerTransaction = new Transaction({
          userId: customer._id,
          postId: post._id,
          amount: transportFee,
          type: "PAYING_FOR_ORDER",
          status: "PAID",
          orderCode: generateOrderCode(),
        });
        await customerTransaction.save();

        const driverTransaction = new Transaction({
          userId: driverUser._id,
          postId: post._id,
          amount: driverAmount,
          type: "RECEIVING_PAYMENT_FROM_ORDER",
          status: "PAID",
          orderCode: generateOrderCode(),
        });
        await driverTransaction.save();
      } else if (post.paymentMethod === "cash") {
        const transportFee = parseFloat(post.price.replace(/,/g, ""));

        const driverId = post.dealId.driverId;

        const driver = await Driver.findById(driverId).populate("userId");

        if (!driver) {
          return res.status(404).json({ message: "Tài xế không tồn tại." });
        }

        const driverUser = await User.findById(driver.userId);

        if (!driverUser) {
          return res
            .status(404)
            .json({ message: "Người dùng tài xế không tồn tại." });
        }

        const driverAmount = transportFee * 0.05;
        driverUser.balance -= driverAmount;
        await driverUser.save();

        const generateOrderCode = () => {
          return Math.floor(100000 + Math.random() * 900000).toString();
        };

        const driverTransaction = new Transaction({
          userId: driverUser._id,
          postId: post._id,
          amount: driverAmount,
          type: "PAY_SYSTEM_FEE",
          status: "PAID",
          orderCode: generateOrderCode(),
        });
        await driverTransaction.save();
      }

      if (customer && customer.email) {
        await sendEmail(
          customer.email,
          "Xác nhận hoàn tất đơn hàng",
          "orderConfirmationForCustomer",
          customer.fullName,
          post._id
        );
      }

      if (driver && driver.userId && driver.userId.email) {
        await sendEmail(
          driver.userId.email,
          "Thông báo hoàn tất chuyến hàng",
          "orderCompletionForDriver",
          driver.fullName,
          post._id
        );
      }

      post.status = "complete";
      await post.save();

      res.status(200).json({ message: "Người dùng đã xác nhận đã nhận hàng." });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({
        message: "Đã xảy ra lỗi trong quá trình xác nhận nhận hàng.",
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
  }
  async updatePostStatus(req, res) {
    try {
      const { idPost } = req.params; 
      const { status } = req.body;  
  
      if (!status) {
        const response = { status: 400, message: "Status is required" };
        if (res) return res.status(400).json(response);
        return response;
      }
  
      const post = await Post.findById(idPost);
      if (!post) {
        const response = { status: 404, message: "Post not found" };
        if (res) return res.status(404).json(response);
        return response;
      }
  
      post.status = status;
  
      const currentTime = new Date();
      if (status === "inprogress") {
        post.startTime = currentTime; 
      } else if (status === "finish") {
        post.endTime = currentTime; 
      }
  
      const updatedPost = await post.save();
  
      const response = {
        status: 200,
        message: "Post status updated successfully",
        updatedPost,
      };
      if (res) return res.status(200).json(response);
      return response;
    } catch (error) {
      const response = {
        status: 500,
        message: "Server error",
        error: error.message,
      };
      if (res) return res.status(500).json(response);
      return response;
    }
  }
}

module.exports = new PostController();
