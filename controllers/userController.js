const User = require("../models/userModel");
const { Connection, PublicKey } = require("@solana/web3.js");
const Transaction = require("../models/paymentRelated/TransactioModel");

const connection = new Connection("https://api.mainnet-beta.solana.com");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
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

    const walletPublicKey = new PublicKey(user.wallet_address);
    const balanceLamports = await connection.getBalance(walletPublicKey);
    const balanceSOL = balanceLamports / 1e9;

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
      wallet_balance: balanceSOL,
      last_transactions: transactions,
      userProfile:user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      notification:user.notificationPreferences
    };

    res.status(200).json({
      success: true,
      message: "Details fetched successfully",
      user: responseData,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch dashboard data", err });
  }
};


module.exports = { getAllUsers, updateProfile, getDashboardData };
