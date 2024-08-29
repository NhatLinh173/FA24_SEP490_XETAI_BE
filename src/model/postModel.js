const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const User = require('./userModel')
const Category = require('./categoryModel')

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
        title: {
            type: String,
            required: true
        },
        detail: {
            type: String,
            required: true
        },
        images: {
            type: [String],
            required: true
        },
       
        load: { //trọng tải
            type: String,
            required: true
        },
        category: { //loại xe
            type: Schema.Types.ObjectId, 
            ref: 'Category', 
            required: true 
        },
        startPoint: { //điểm xuất phát
            type: String,
            required: true
        },
        destination: { //đích đến
            type: String,
            required: true
        },
        price: { //giá tiền
            type: String,
            required: true
        },
        packageType: { //Loại hàng
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
        isLock: { //Khóa hoặc mở bài đăng (ẩn hoặc hiện)
            type: Boolean,
            default: false
        },
        isFinish: { //thể hiện đã hoàn thành hay chưa (hoàn thành rồi thì ẩn luôn search mếu ra nữa :D )
            type: Boolean,
            default: false
        },
        
    },
    {
        timestamps: true
    })

module.exports = mongoose.model("Post",Post );