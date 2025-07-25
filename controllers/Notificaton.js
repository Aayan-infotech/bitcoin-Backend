const { default: mongoose } = require("mongoose");
const { sendNotification } = require("../config/pushNotification");
const Notification = require("../models/Notification");
const User = require("../models/userModel");

exports.getAllNotifications = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const allNotifications = await Notification.find({
      type: "promotional",
      userId: { $ne: null },
      sentBy: { $ne: null },
    })
      .populate("userId", "name email")
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 });

    // Step 2: Group notifications by broadcastId or _id
    const groupedMap = new Map();

    for (const notif of allNotifications) {
      const key = notif.broadcastId?.toString() || notif._id.toString();

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          _id: notif._id,
          message: notif.message,
          type: notif.type,
          sentBy: notif.sentBy?.name || "Unknown",
          sentByEmail: notif.sentBy?.email || "",
          createdAt: notif.createdAt,
          recipients: [notif.userId?.name || "Unknown"],
          isBroadcast: !!notif.broadcastId,
        });
      } else {
        groupedMap.get(key).recipients.push(notif.userId?.name || "Unknown");
      }
    }

    // Step 3: Format grouped array
    const groupedArray = Array.from(groupedMap.values()).map((item) => ({
      _id: item._id,
      message: item.message,
      type: item.type,
      sentBy: item.sentBy,
      sentByEmail: item.sentByEmail,
      sentTo: item.isBroadcast ? "Sent to All" : item.recipients[0],
      createdAt: item.createdAt,
    }));
    const totalCount = groupedArray.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedData = groupedArray.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      message: "All messages fetched successfully",
      data: paginatedData,
      total: totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const prefs = user.notificationPreferences;
    const typesUserWants = Object.keys(prefs).filter((type) => prefs[type]);

    const notifications = await Notification.find({
      userId: user._id,
      type: { $in: typesUserWants },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
      message: "Notifications fetched succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching the notifications",
      error,
    });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  const updates = req.body;

  // const validTypes = ["quiz", "course", "transaction", "ads"];
  const validTypes = ["promotional", "wallet", "transaction", "security"];

  const isValidUpdate = Object.keys(updates).every((key) =>
    validTypes.includes(key)
  );

  if (!isValidUpdate) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid preference key" });
  }

  try {
    if (!req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Invalid Token",
      });
    }
    const user = await User.findById(req.user.id);

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...updates,
    };

    await user.save();

    res.json({
      success: true,
      message: "Preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createAdminPushNotification = async (req, res) => {
  try {
    const { message, type = "promotional", targetUserId } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required." });
    }

    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (targetUserId) {
      await sendNotification(targetUserId, message, type, req.user.id);
    } else {
      const users = await User.find({});
      if (!users.length) {
        return res
          .status(404)
          .json({ success: false, message: "No users found ." });
      }

      const userIds = users.map((user) => user._id);
      const broadcastId = new mongoose.Types.ObjectId(); // shared ID for all notifications

      await sendNotification(userIds, message, type, req.user.id, broadcastId);
    }

    return res
      .status(200)
      .json({ success: true, message: "Notification(s) sent." });
  } catch (error) {
    console.error("Error sending admin push notification:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
exports.deleteUserNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ userId });

    return res
      .status(200)
      .json({ success: true, message: "Notifications Deleted Successfully" });
  } catch (error) {
    console.error("Error sending admin push notification:", error);
    return res.status(500).json({ success: false, message:"Server error." });
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    const {id} = req.params;
    await Notification.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Notification Deleted Successfully" });
  } catch (error) {
    console.error("Error sending admin push notification:", error);
    return res.status(500).json({ success: false, message:"Server error." });
  }
};
