const User = require("../models/userModel");
const Transaction = require("../models/paymentRelated/TransactioModel");
const { getBalanceForAddress } = require("./WalletController/WalletController");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail"); // Your existing email logic

const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const users = await User.find({ accountType: { $ne: "Admin" } })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ accountType: { $ne: "Admin" } });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching users",
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
      error: error,
    });
  }
};
const setMPIN = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { mpin } = req.body;
    if (!mpin || typeof mpin !== "string" || mpin.length !== 4) {
      return res.status(400).json({
        message: "Invalid MPIN format or MPIN is NULL",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.setMPIN(mpin);
    await user.save();

    return res.json({ success: true, message: "MPIN set successfully" });
  } catch (error) {
    console.error("Error while setting MPIN:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
const verifyMPIN = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { mpin } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.mpinHash) {
      return res
        .status(404)
        .json({ message: "MPIN not set or user not found" });
    }

    const isValid = await user.verifyMPIN(mpin);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    return res.json({ success: true, message: "MPIN verified" });
  } catch (error) {
    console.error("Error verifying MPIN:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const requestMPINReset = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otp = "111111"; // 6-digit OTP
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.mpinResetOtp = otp;
    user.mpinResetExpires = new Date(otpExpire);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "MPIN Reset OTP",
      text: `Your MPIN reset OTP is: ${otp}. It expires in 10 minutes.`,
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error requesting MPIN reset:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const resetMPINWithOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otp, newMpin } = req.body;

    if (!/^\d{4}$/.test(newMpin)) {
      return res.status(400).json({ message: "MPIN must be exactly 4 digits" });
    }

    const user = await User.findById(userId).select(
      "+mpinResetOtp +mpinResetExpires +mpinHash"
    );

    if (!user || user.mpinResetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.mpinResetExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    await user.setMPIN(newMpin);
    user.mpinResetOtp = undefined;
    user.mpinResetExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "MPIN reset successfully" });
  } catch (error) {
    console.error("Error resetting MPIN:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
      // console.log(userBalance);
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
      mpin: user.mpinHash ? true : false,
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
const getUserTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const walletAddress = user.wallet_address;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "User does not have a wallet address",
      });
    }

    const transactions = await Transaction.find({
      $or: [{ from: walletAddress }, { to: walletAddress }],
    }).sort({ timestamp: -1 });
    const formatted = transactions.map((tx) => ({
      ...tx._doc,
      type: tx.from === walletAddress ? "Sent" : "Received",
    }));

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUserTransactionHistory,
  getUserTransactionHistory,
  resetMPINWithOtp,
  requestMPINReset,
  setMPIN,
  verifyMPIN,
  getAllUsers,
  getAllNotificationUsers,
  updateProfile,
  getDashboardData,
};
