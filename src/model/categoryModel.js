const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const Category = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      //slug là kiểu nó chuyển cái tên thành xe-tai-100-tan, lúc truyền param url thân thiện với người dùng hơn
      type: String,
      slug: "name",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", Category);
