const mongoose = require('mongoose')
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);


const Category = new Schema({
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        slug : { //slug là kiểu nó chuyển ký tự ví dụ : xe tải chở hàng thành xe-tai-cho-hang
            type : String,
            slug: 'name',
            unique:true
        }
    },
    {
        timestamps: true
    })

module.exports = mongoose.model("Category", Category);