const DriverLocation = require("../model/driverLocation");
const Post = require("../model/postModel");
const getLocationByOrderCode = async (orderCode) => {
  try {
    const post = await Post.findOne({ orderCode })
      .populate("startPoint")
      .populate("destination")
      .populate("startPointCity")
      .populate("destinationCity");
    return {
      orderCode: post.orderCode,
      startPoint: post.startPoint,
      destination: post.destination,
      startPointCity: post.startPointCity,
      destinationCity: post.destinationCity,
    };
  } catch (error) {
    throw new Error(
      `Error fetching post for order code ${orderCode}: ${error.message}`
    );
  }
};

const saveDriverLocation = async (post, driverId, location) => {
  try {
    const driverLocation = new DriverLocation({
      orderCode: post.orderCode, // Gắn orderCode từ bài đăng
      driverId: driverId, // ID tài xế
      location: {
        type: "Point",
        coordinates: location, // Tọa độ (mảng [longitude, latitude])
      },
      startPoint: post.startPoint,
      destination: post.destination,
      startPointCity: post.startPointCity, // Lưu lại startPointCity
      destinationCity: post.destinationCity, // Lưu lại destinationCity
    });

    // Lưu vị trí tài xế vào bảng DriverLocation
    await driverLocation.save();
    return driverLocation; // Trả về bản ghi đã lưu
  } catch (error) {
    throw new Error(`Error saving driver location: ${error.message}`);
  }
};

const updateDriverLocation = async (orderCode, latitude, longitude) => {
  try {
    const location = await DriverLocation.findOne({ orderCode });
    if (location) {
      location.location = { lat: latitude, lng: longitude };
      location.updatedAt = new Date();
      await location.save();
    } else {
      const newLocation = new DriverLocation({
        orderCode,
        location: { lat: latitude, lng: longitude },
        updatedAt: new Date(),
      });
      await newLocation.save();
    }
  } catch (error) {
    throw new Error(`Error updating location: ${error.message}`);
  }
};

module.exports = {
  getLocationByOrderCode,
  updateDriverLocation,
  saveDriverLocation,
};
