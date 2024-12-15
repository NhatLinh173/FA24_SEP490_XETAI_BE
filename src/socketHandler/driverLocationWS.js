const DriverLocation = require("../model/driverLocation");
const Post = require("../model/postModel");
const User = require("../model/userModel");

module.exports = (io) => {
  const driverIntervals = new Map();

  io.on("connection", async (socket) => {
    socket.on("authenticate", async ({ userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("locationError", { message: "User not found" });
          return;
        }

        if (user.role === "driver") {
          socket.userId = userId;
          socket.emit("requestLocation");

          const interval = setInterval(() => {
            socket.emit("requestLocation");
          }, 900000);

          driverIntervals.set(socket.userId, interval);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        socket.emit("locationError", { message: "Authentication failed" });
      }
    });

    socket.on("sendLocation", async ({ location }) => {
      try {
        if (!socket.userId) {
          throw new Error("User not authenticated");
        }

        await DriverLocation.findOneAndUpdate(
          { driverId: socket.userId },
          {
            location,
            updatedAt: new Date(),
            isAvailable: true,
          },
          { upsert: true, new: true }
        );

        // Broadcast vị trí mới
        io.emit("driverLocationUpdated", {
          driverId: socket.userId,
          location,
        });
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("locationError", { message: "Failed to update location" });
      }
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        if (driverIntervals.has(socket.userId)) {
          clearInterval(driverIntervals.get(socket.userId));
          driverIntervals.delete(socket.userId);
        }
      }
    });
  });
};
