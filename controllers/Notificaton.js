const Notification = require("../models/Notification");

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
