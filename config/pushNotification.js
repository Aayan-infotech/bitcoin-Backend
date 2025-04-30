const Notification = require("../models/Notification");
const User = require("../models/userModel");
const admin = require("./firebse");

const sendNotification = async (userId, message, type = "promotional") => {
  try {
    // Save the notification in MongoDB
    const newNotification = new Notification({
      userId,
      message,
      type,
    });
    await newNotification.save();

    // Fetch user's FCM token
    const user = await User.findById(userId);
    if (!user?.deviceToken) {
      console.log("No FCM token found for user.");
      return;
    }

    const fcmMessage = {
      token: user.deviceToken,
      notification: {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        body: message,
      },
      data: {
        notificationId: newNotification._id.toString(),
        userId: userId.toString(),
      },
    };
    try {
      const response = await admin.messaging().send(fcmMessage);
      console.log("Push notification sent:", response);
    } catch (fcmError) {
      console.error("FCM error:", fcmError.message);
    }
  } catch (err) {
    console.error("Failed to send push notification:", err.message);
  }
};

module.exports = { sendNotification };
