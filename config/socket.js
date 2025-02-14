const { Server } = require("socket.io");
const User = require("../models/userModel");
const Notification = require("../models/Notification");

const connectedUsers = {}; // Store active socket connections

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // ✅ Store the io instance globally
  global.io = io;  // 🔥 Important: Now you can access it anywhere

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 🔹 Register user
    socket.on("register", async (userSocketId) => {
      if (!userSocketId) return;

      await User.findByIdAndUpdate(userSocketId, { socketId: socket.id });
      connectedUsers[userSocketId] = socket.id;

      console.log(`User ${userSocketId} registered with socket ID ${socket.id}`);
    });

    // 🔹 Send Notification
    socket.on("sendNotification", async ({ userSocketId, message }) => {
      try {
        const user = await User.findById(userSocketId);
        if (!user) return;

        const notification = new Notification({ userSocketId, message });
        await notification.save();

        if (user.socketId) {
          io.to(user.socketId).emit("receiveNotification", message);
          console.log(`Notification sent to ${userSocketId}`);
        } else {
          console.log(`User ${userSocketId} is offline, notification stored`);
        }
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });

    // 🔹 Broadcast message
    socket.on("broadcast", async (message) => {
      try {
        io.emit("receiveNotification", message);
        await Notification.create({ message, broadcast: true });
        console.log("Broadcast message sent.");
      } catch (error) {
        console.error("Error broadcasting:", error);
      }
    });

    // 🔹 Handle Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      try {
        const user = await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
        if (user) delete connectedUsers[user._id.toString()];
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return io;
}

module.exports = setupSocket;
