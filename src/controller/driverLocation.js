const driverLocationService = require("../service/driverLocationService");

const getLocationByOrderCode = async (req, res) => {
  const { orderCode } = req.params;

  try {
    const post = await driverLocationService.getLocationByOrderCode(orderCode);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found for this order code" });
    }

    const { driverId, location } = req.body;

    const driverLocation = await driverLocationService.saveDriverLocation(
      post,
      driverId,
      location
    );

    res.json({
      driverLocation,
      startPoint: post.startPoint,
      destination: post.destination,
      startPointCity: post.startPointCity,
      destinationCity: post.destinationCity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateDriverLocation = async (req, res) => {
  const { orderCode } = req.params;
  const { latitude, longitude } = req.body;

  try {
    await driverLocationService.updateDriverLocation(
      orderCode,
      latitude,
      longitude
    );
    res.status(200).json({ message: "Driver location updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Error updating driver location",
      error: error.message,
    });
  }
};

module.exports = {
  getLocationByOrderCode,
  updateDriverLocation,
};
