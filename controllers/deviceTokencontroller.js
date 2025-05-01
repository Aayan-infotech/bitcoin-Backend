const DeviceToken = require("../models/deviceToken");

exports.registerOrUpdateDeviceToken = async (req, res) => {
  try {
    const { userId, deviceToken, type } = req.body;

    if (!deviceToken || !type) {
      return res.status(400).json({
        success: false,
        message: "deviceToken and type are required.",
      });
    }

    if (!["ios", "android"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device type. Must be 'ios' or 'android'.",
      });
    }

    const tokenDoc = await DeviceToken.findOneAndUpdate(
      { deviceToken },
      { userId, type },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Device token registered or updated successfully.",
      data: tokenDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register or update device token.",
      error: error.message,
    });
  }
};

// Get all device tokens
exports.getAllDeviceTokens = async (req, res) => {
  try {
    const tokens = await DeviceToken.find();
    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve device tokens.",
      error: error.message,
    });
  }
};

// Get device token by ID
exports.getDeviceTokenById = async (req, res) => {
  try {
    const token = await DeviceToken.findById(req.params.id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Device token not found.",
      });
    }
    res.status(200).json({
      success: true,
      data: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving device token.",
      error: error.message,
    });
  }
};

// Delete device token by ID
exports.deleteDeviceToken = async (req, res) => {
  try {
    const deleted = await DeviceToken.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Device token not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Device token deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting device token.",
      error: error.message,
    });
  }
};
