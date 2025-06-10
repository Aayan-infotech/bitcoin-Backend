const RewardClaimRequestModel = require("../../models/RewardClaimRequestModel");
const User = require("../../models/userModel");
const RewardClaimRequest = require("../../models/RewardClaimRequestModel");
const {
  sendTransaction,
  getTransaction,
  getBalance,
  getProvider,
  sendTransactionUser, 
} = require("../../service/etheriumService");
const { saveTransactionReceipt } = require("../../utils/fileStorage");
const { ethers } = require("ethers");

exports.sendCoins = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!amount) {
      return res.status(400).json({ error: "Amount is missing" });
    }

    const user = await User.findById(userId);
    if (!user || !user.wallet_address) {
      return res.status(404).json({ error: "User or wallet address not found" });
    }

    const tx = await sendTransaction(user.wallet_address, amount);
    const receipt = await tx.wait();

    const provider = await getProvider(); // ✅ Get initialized provider
    const gasPrice = await provider.getGasPrice();
    const gasUsed = receipt.gasUsed;
    const totalFee = gasPrice.mul(gasUsed); // BigNumber

    await saveTransactionReceipt({
      from: tx.from,
      to: user.wallet_address,
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      amount: amount + " ETH",
      status: receipt.status === 1 ? "Success" : "Failed",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Transaction successful",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      amount: amount + " ETH",
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      status: receipt.status === 1 ? "Success" : "Failed",
    });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Transaction failed", details: err.message });
  }
};

exports.checkTransaction = async (req, res) => {
  try {
    const { hash } = req.params;
    const tx = await getTransaction(hash);
    res.status(200).json(tx);
  } catch (err) {
    res.status(404).json({ error: "Transaction not found" });
  }
};

exports.getBalanceForAddress = async (address) => {
  return await getBalance(address);
};

exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const balance = await getBalance(address);
    res.status(200).json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve balance" });
  }
};
exports.getPendingRewardClaims = async (req, res) => {
  try {
    const claims = await RewardClaimRequestModel.find({ status: "Pending" });
    res.status(200).json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch claims", error: error.message });
  }
};
exports.approveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await RewardClaimRequest.findById(claimId);
    if (!claim || claim.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Invalid claim" });
    }

    // Update user points
    await User.findByIdAndUpdate(claim.user, { $inc: { quizPoints: claim.score } });

    // Update claim status
    claim.status = "Approved";
    await claim.save();

    // Optionally update original attempt
    await QuizAttempt.findOneAndUpdate({ userId: claim.user, quizId: claim.quizId }, { rewardClaimed: true });

    res.status(200).json({ success: true, message: "Claim approved and points granted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve claim", error: error.message });
  }
};

exports.sendCoinsUsers = async (req, res) => {
  try {
    const userIdFrom = req.user.id;
    const { receiverName, userIdTo, amount, amountInUsd } = req.body;
 
    // Validate inputs
    if (!userIdFrom || !userIdTo || !amount) {
      return res.status(400).json({ error: "userIdFrom, userIdTo, and amount are required" });
    }
 
    // Get sender and receiver
    const userFrom = await User.findById(userIdFrom);
    // const userFrom = await User.find({ wallet_address : userIdFrom });
    // const userTo = await User.find({ wallet_address : userIdTo });
    // const userTo = await User.findById(userIdTo);
 
    if (!userFrom || !userFrom.wallet_address) {
      return res.status(404).json({ error: "Sender or wallet address not found" });
    }
 
    // if (!userTo || !userTo.wallet_address) {
    //   return res.status(404).json({ error: "Receiver or wallet address not found" });
    // }
 
    if (!userFrom.private_key_encrypted) {
      return res.status(400).json({ error: "Sender private key is missing" });
    }
    encryptedKey1 = userFrom.private_key_encrypted;
    //console.log("Encrypted key:", encryptedKey1, "Type:", typeof encryptedKey1);
 
    // Parse and decrypt private key
    // let encryptedKey1;
    // let encryptedKey;
    // try {
    //   encryptedKey = JSON.parse(userFrom.private_key_encrypted);
    // } catch (err) {
    //   return res.status(400).json({ error: "Invalid encrypted key format" });
    // }
 
    // if (!encryptedKey.iv || !encryptedKey.content) {
    //   return res.status(400).json({ error: "Encrypted key missing iv or content" });
    // }
 
    // let decryptedKey;
    // try {
    //   decryptedKey = decrypt(encryptedKey);
    // } catch (err) {
    //   return res.status(400).json({ error: "Failed to decrypt key", details: err.message });
    // }
 
    // // Ensure key is properly formatted
    // if (!/^0x[0-9a-fA-F]{64}$/.test(decryptedKey)) {
    //   decryptedKey = "0x" + Buffer.from(decryptedKey).toString("hex");
    // }
 
    // console.log("Decrypted key:", decryptedKey, "Type:", typeof decryptedKey);
    // if (!/^0x[0-9a-fA-F]{64}$/.test(decryptedKey)) {
    //   return res.status(400).json({ error: "Invalid decrypted private key format" });
    // }
 
    // Send transaction
    const tx = await sendTransactionUser(encryptedKey1, userIdTo, amount);
    const receipt = await tx.wait();
 
    // Get gas fee
    const provider = await getProvider();
    const gasPrice = await provider.getGasPrice();
    const gasUsed = receipt.gasUsed;
    const totalFee = gasPrice.mul(gasUsed);
 
    // Save transaction
    await saveTransactionReceipt({
      from: userFrom.wallet_address,
      to: userIdTo,
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      amount: amount + " ETH",
      status: receipt.status === 1 ? "Success" : "Failed",
      receiverName: receiverName,
      amountInUsd: amountInUsd,
      timestamp: new Date().toISOString(),
    });
 
    // Success response
    res.status(200).json({
      message: "Transaction successful",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      amount: amount + " ETH",
      amountInUsd: amountInUsd,
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      status: receipt.status === 1 ? "Success" : "Failed",
    });
 
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Transaction failed", details: err.message });
  }
};
