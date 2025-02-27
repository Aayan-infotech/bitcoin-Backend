const { Server } = require("socket.io");
const Notification = require("../models/Notification");

const connectedUsers = {}; // Store online users

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ A user connected:", socket.id);

    // Register user socket connection
    socket.on("register", (data) => {
      if (data.event === "register") {
        const { userId } = data; // Extract userId from data object
        console.log("User registered:", userId);
        connectedUsers[userId] = socket.id;
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
      for (const [key, value] of Object.entries(connectedUsers)) {
        if (value === socket.id) {
          delete connectedUsers[key];
        }
      }
    });
  });

  // Function to send notifications
  const sendNotification = async (userId, message, type) => {
    const newNotification = new Notification({
      userId,
      message,
      type,
    });
    await newNotification.save();

    // Send real-time notification if the user is online
    const socketId = connectedUsers[userId];
    if (socketId) {
      io.to(socketId).emit("newNotification", newNotification);
    }
  };

  // Expose sendNotification globally
  global.sendNotification = sendNotification;
};

module.exports = setupSocket;
