const Notification = require("../models/Notification");
const User = require("../models/userModel");

exports.getAllNotifications = async (req, res) => {
  try {
    const allNotifications = await Notification.find({});
    if (!allNotifications) {
      return res.status(402).json({
        success: false,
        message: "No Message found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All messages fetched  successfully",
      allNotifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications" });
  }
};
// *******this is the notification controller to fetch only allowed notifications ill refactor it later **********
// controller/notificationController.js
exports.getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const prefs = user.notificationPreferences;

    const typesUserWants = Object.keys(prefs).filter((type) => prefs[type]);

    const notifications = await Notification.find({
      userId: user._id,
      type: { $in: typesUserWants },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications,message:"Notifications fetched succesfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching the notifications",
      error
    });
  }
};

exports.getAllNotificationsByuserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(402)
        .json({ success: false, message: "Id is required" });
    }

    const notifications = await Notification.find({ userId: id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications" });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  const updates = req.body;

  const validTypes = ["security", "promotional", "transaction", "ads"];

  const isValidUpdate = Object.keys(updates).every((key) =>
    validTypes.includes(key)
  );

  if (!isValidUpdate) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid preference key" });
  }

  try {
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
