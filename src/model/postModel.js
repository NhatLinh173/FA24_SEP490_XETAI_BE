const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const User = require('./userModel')
const Category = require('./categoryModel')
const Driver = require('./driverModel')


const Comment = new Schema({
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        detail: {
            type: String,
            required: true
        },
        userComment: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    })


const Post = new Schema({
        title: { //loại hàng
            type: String,
            required: true
        },
        detail: { //mô tả chi tiết 
            type: String,
            required: true
        },
        images: {
            type: [String],
            required: true
        },
       
        load: { //trọng lượng hàng
            type: String,
            required: true
        },
        category: { //loại xe
            type: Schema.Types.ObjectId, 
            ref: 'Category', 
            required: true 
        },
        startPoint: { //điạ chỉ nhận hàng
            type: String,
            required: true
        },
        destination: { //địa chỉ giao hàng
            type: String,
            required: true
        },
        price: { //giá tiền
            type: String,
            required: true
        },
        fullname: { 
            type: String,
            required: true
        },
        email: { 
            type: String,
            required: true
        },
        phone: { 
            type: String,
            required: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'Driver'
        },
        orderer: { //Id của người đặt (của cái account dùng để đặt ấy )
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        isLock: { //Khóa hoặc mở bài đăng (ẩn hoặc hiện)
            type: Boolean,
            default: false
        },
        isFinish: { //thể hiện đã hoàn thành hay chưa (hoàn thành rồi thì ẩn luôn search mếu ra nữa :D )
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['wait', 'approve', 'inprogress', 'finish', 'cancel'], // Giới hạn các giá trị có thể nhận
            default: 'wait',  // Giá trị mặc định ban đầu
          }

        
    },
    {
        timestamps: true
    })

module.exports = mongoose.model("Post",Post );