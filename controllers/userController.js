const User = require("../models/userModel");
const Transaction = require("../models/paymentRelated/TransactioModel");
const { getBalanceForAddress } = require("./WalletController/WalletController");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ accountType: { $ne: "Admin" } });
    return res.status(200).json({
      success: true,
      message: "Users fetched Successfully",
      users,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error Occured while fetching all the users",
    });
  }
};
const getAllNotificationUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email");
    return res.status(200).json({
      success: true,
      message: "Users fetched Successfully",
      users,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error Occured while fetching all the users",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const image = req?.fileLocations[0];
    const { mobileNumber, name, gender } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (image) user.image = image;

    await user.save();
    return res.status(200).json({
      success: true,
      message: "User data updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating user profile",
      error: error.message,
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let userBalance;
    try {
      userBalance = await getBalanceForAddress(user.wallet_address);
      console.log(userBalance);
    } catch (err) {
      console.error(err);
    }
    // last 10 transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Create a new object instead of modifying `user`
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      mobileNumber: user.mobileNumber,
      wallet_address: user.wallet_address,
      wallet_balance: userBalance,
      last_transactions: transactions,
      userProfile: user.image,
      userType: user.accountType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      biometricAuth: user.biometricAuth,
      notification: user.notificationPreferences,
    };

    res.status(200).json({
      success: true,
      message: "Details fetched successfully",
      user: responseData,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch dashboard data", err });
  }
};

module.exports = {
  getAllUsers,
  getAllNotificationUsers,
  updateProfile,
  getDashboardData,
};
