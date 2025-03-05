const Notification = require("../models/Notification");

exports.createNotification = async (userId, title, message, type = "info") => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
    });

    
    // Emit real-time notification (if using Socket.io)
    if (global.io) {
        await notification.save();
        console.log(global.io)
        global.io.to(userId.toString()).emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
