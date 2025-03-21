const Notification = require("../models/Notification");

exports.createNotification = async (userId, title, message, type = "info") => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
    });

    if (global.io) {
      await notification.save();
      console.log(global.io);
      global.io.to(userId.toString()).emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Failed while performing the operation",
    });
  }
};
