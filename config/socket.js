const { Server } = require("socket.io");
const Notification = require("../models/Notification");

const connectedUsers = {}; 

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {

    socket.on("register", (data) => {
      if (data.event === "register") {
        const { userId } = data; 
        connectedUsers[userId] = socket.id;
      }
    });

    socket.on("disconnect", () => {
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

  global.sendNotification = sendNotification;
};

module.exports = setupSocket;
