const User = require("../models/userModel");

// Register or Update Device Token (on User model)
exports.registerOrUpdateDeviceToken = async (req, res) => {
  try {
    const {  deviceToken } = req.body;
    const userId=req.user.id
    const platform = req.headers['platform']; // 'ios' or 'android'
    if (!userId || !deviceToken || !platform) {
      return res.status(400).json({
        success: false,
        message: "userId, deviceToken, and platform (in headers) are required.",
      });
    }

    const type = platform.toLowerCase();
    if (!["ios", "android"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform type. Must be 'ios' or 'android'.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { deviceToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device token registered or updated successfully.",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register or update device token.",
      error: error.message,
    });
  }
};

// Get all users with device tokens
exports.getAllDeviceTokens = async (req, res) => {
  try {
    const usersWithTokens = await User.find({ deviceToken: { $ne: null } }, '_id name email deviceToken');
    res.status(200).json({
      success: true,
      data: usersWithTokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve device tokens.",
      error: error.message,
    });
  }
};

// Get device token by User ID
exports.getDeviceTokenByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '_id name email deviceToken');
    if (!user || !user.deviceToken) {
      return res.status(404).json({
        success: false,
        message: "Device token not found for the specified user.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving device token.",
      error: error.message,
    });
  }
};

// Remove device token (logout or uninstall case)
exports.removeDeviceToken = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { deviceToken: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device token removed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing device token.",
      error: error.message,
    });
  }
};
