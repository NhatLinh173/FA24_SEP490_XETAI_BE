const DriverLocation = require("../model/driverLocation");
const Post = require("../model/postModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    let updateInterval;

    socket.on("updateDriverLocation", async ({ orderCode, location }) => {
      try {
        const post = await Post.findOne({ orderCode });
        if (!post) {
          throw new Error("Order not found");
        }
        const driverId = post.dealId;

        if (post.status === "inprogress") {
          if (updateInterval) {
            clearInterval(updateInterval);
          }

          await DriverLocation.findOneAndUpdate(
            { driverId, orderCode },
            { location, updatedAt: new Date() },
            { upsert: true, new: true }
          );

          updateInterval = setInterval(async () => {
            await DriverLocation.findOneAndUpdate(
              { driverId, orderCode },
              { location, updatedAt: new Date() },
              { upsert: true, new: true }
            );
            console.log(
              `Location auto-updated for driver ${driverId} and order ${orderCode}`
            );
          }, 60 * 60 * 1000);
        } else {
          console.log(
            "Stopped location update as order status is not 'inprogress'."
          );
        }
      } catch (error) {
        console.error("Error processing driver location update:", error);
      }
    });

    socket.on("disconnect", () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        console.log("Clearing interval on disconnect");
      }
    });
  });
};
