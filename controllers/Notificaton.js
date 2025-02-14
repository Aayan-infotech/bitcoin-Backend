const Notification = require("../models/Notification");

exports.getAllNotifications = async (req, res) => {
  const allNotifications = await Notification.find({});
  if (!allNotifications) {
    return res.status(402).json({
      success: false,
      message: "No Message found",
    });
  }

  return res.status(200).json({
    success:true,
    message:"All messages fetched  successfully",
    allNotifications
  })
};
exports.getAllNotificationsByuserId = async (req, res) => {
    const {id}=req.params
  const allNotifications = await Notification.find({userId:id});
  if (!allNotifications) {
    return res.status(402).json({
      success: false,
      message: "No Message found",
    });
  }

  return res.status(200).json({
    success:true,
    message:"All messages of user fetched  successfully",
    allNotifications
  })
};
