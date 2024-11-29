const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./userModel");
const Category = require("./categoryModel");
const Driver = require("./driverModel");

const Comment = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    detail: {
      type: String,
      required: true,
    },
    userComment: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Post = new Schema(
  {
    title: {
      //loại hàng
      type: String,
      required: true,
    },
    detail: {
      //mô tả chi tiết
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    load: {
      //trọng lượng hàng
      type: Number,
      required: true,
    },
    startPoint: {
      //điạ chỉ lấy hàng chi tiết
      type: String,
      required: true,
    },
    destination: {
      //địa chỉ giao hàng chi tiết
      type: String,
      required: true,
    },
    price: {
      //giá tiền
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    // },
    phone: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },

    orderer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isLock: {
      //Khóa hoặc mở bài đăng (ẩn hoặc hiện)
      type: Boolean,
      default: false,
    },
    isFinish: {
      //thể hiện đã hoàn thành hay chưa (hoàn thành rồi thì ẩn luôn search mếu ra nữa :D )
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "wait",
        "approve",
        "inprogress",
        "finish",
        "cancel",
        "hide",
        "complete",
        "locked",
      ], // Giới hạn các giá trị có thể nhận
      default: "wait", // Giá trị mặc định ban đầu
    },
    deliveryTime: {
      //thời gian giao hàng dự kiến
      type: Date,
    },
    deliveryHour: {
      //thời gian giao hàng dự kiến
      type: String,
    },
    startPointCity: {
      //TP/tỉnh nơi lấy hàng
      type: String,
      required: true,
    },
    destinationCity: {
      //TP/tỉnh nơi nhận hàng
      type: String,
      required: true,
    },
    // recipientEmail: {
    //   type: String,
    //   required: true,
    // },
    recipientPhone: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    userConfirmed: {
      type: Boolean,
      default: false,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", Post);
