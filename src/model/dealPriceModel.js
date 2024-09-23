const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Driver = require('./driverModel')
const Post = require('./postModel')

const Deal = new Schema(
    {
      postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      },
      driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
      },
      dealPrice: {
        type:String,
        unique: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = mongoose.model("Deal", Deal);