const Notification = require("../models/Notification");
const User = require("../models/userModel");
const firebasePromise = require("./firebase");

const sendNotification = async (userIds, message, type = "promotional", sentBy, broadcastId = null) => {
  try {
    const admin = await firebasePromise; 

    const ids = Array.isArray(userIds) ? userIds : [userIds];

    const notificationsToInsert = ids.map((userId) => ({
      userId,
      message,
      type,
      sentBy,
      broadcastId,
    }));

    const savedNotifications = await Notification.insertMany(notificationsToInsert);

    // Step 2: Send push notifications
    const usersWithTokens = await User.find({
      _id: { $in: ids },
      deviceToken: { $exists: true, $ne: null },
    });

    for (const user of usersWithTokens) {
      const notification = savedNotifications.find((n) =>
        n.userId.toString() === user._id.toString()
      );

      const fcmMessage = {
        token: user.deviceToken,
        notification: {
          title: type.charAt(0).toUpperCase() + type.slice(1),
          body: message,
        },
        data: {
          notificationId: notification?._id.toString() || "",
          userId: user._id.toString(),
          broadcastId: broadcastId?.toString() || "",
        },
      };

      try {
        const response = await admin.messaging().send(fcmMessage);
      } catch (err) {
        console.error(`FCM error for ${user._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Notification send failed:", err.message);
  }
};

module.exports = { sendNotification };
