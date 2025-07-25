const RewardClaimRequestModel = require("../../models/RewardClaimRequestModel");
const User = require("../../models/userModel");
const RewardClaimRequest = require("../../models/RewardClaimRequestModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const Transaction = require("../../models/paymentRelated/TransactioModel");
const {
  sendTransaction,
  getTransaction,
  getBalance,
  getProvider,
  sendTransactionUser,
} = require("../../service/etheriumService");
const { saveTransactionReceipt } = require("../../utils/fileStorage");
const { ethers } = require("ethers");
const { sendNotification } = require("../../config/pushNotification");

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
      return res
        .status(404)
        .json({ error: "User or wallet address not found" });
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
      totalFeeValue: ethers.utils.formatEther(totalFee),
      amount: amount + " ETH",
      amountValue: amount,
      status: receipt.status === 1 ? "Success" : "Failed",
      timestamp: new Date().toISOString(),
    });

    sendNotification(
      userId,
      `${amount} has been credited into your wallet`,
      "wallet"
    );

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
    const claims = await RewardClaimRequestModel.find({status:"Pending"}).populate(
      "user",
      "name"
    );
    res.status(200).json({ success: true, claims });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch claims",
      error: error.message,
    });
  }
};

exports.approveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    // const { amount } = req.body;
    const amount = "0.00001";
    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });
    }

    const claim = await RewardClaimRequest.findById(claimId);
    if (!claim || claim.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Invalid or already processed claim",
      });
    }

    const user = await User.findById(claim.user);
    if (!user || !user.wallet_address) {
      return res
        .status(404)
        .json({ success: false, message: "User or wallet address not found" });
    }

    const tx = await sendTransaction(user.wallet_address, amount);
    const receipt = await tx.wait();

    const provider = await getProvider();
    const gasPrice = await provider.getGasPrice();
    const gasUsed = receipt.gasUsed;
    const totalFee = gasPrice.mul(gasUsed);

    await saveTransactionReceipt({
      from: tx.from,
      to: user.wallet_address,
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      totalFeeValue: ethers.utils.formatEther(totalFee),
      amount: amount + " ETH",
      amountValue: amount,
      status: receipt.status === 1 ? "Success" : "Failed",
      timestamp: new Date().toISOString(),
    });

    await User.findByIdAndUpdate(user._id, {
      $inc: { quizPoints: claim.score },
    });

    claim.status = "Approved";
    await claim.save();

    await QuizAttempt.findOneAndUpdate(
      { userId: user._id, quizId: claim.quizId },
      { rewardClaimed: true }
    );
    sendNotification(
      user._id,
      `Your request for reward claim has been approved by the admin, coins are available into your wallet`,
      "wallet"
    );

    res.status(200).json({
      success: true,
      message: "Claim approved, points granted, and crypto sent",
      transactionHash: tx.hash,
      amountSent: amount,
    });
  } catch (error) {
    console.error("Error approving claim:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve claim and send coins",
      error: error.message,
    });
  }
};

exports.sendCoinsUsers = async (req, res) => {
  try {
    const userIdFrom = req.user.id;
    const { receiverName, userIdTo, amount, amountInUsd } = req.body;

    // Validate inputs
    if (!userIdFrom || !userIdTo || !amount) {
      return res
        .status(400)
        .json({ error: "userIdFrom, userIdTo, and amount are required" });
    }

    // Get sender and receiver
    const userFrom = await User.findById(userIdFrom);
    const userto = await User.find({ wallet_address: userIdTo });
    // const userFrom = await User.find({ wallet_address : userIdFrom });
    // const userTo = await User.find({ wallet_address : userIdTo });
    // const userTo = await User.findById(userIdTo);

    if (!userFrom || !userFrom.wallet_address) {
      return res
        .status(404)
        .json({ error: "Sender or wallet address not found" });
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

    await saveTransactionReceipt({
      from: userFrom.wallet_address,
      to: userIdTo,
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei") + " gwei",
      totalFee: ethers.utils.formatEther(totalFee) + " ETH",
      totalFeeValue: ethers.utils.formatEther(totalFee),
      amount: amount + " ETH",
      amountValue: amount,
      status: receipt.status === 1 ? "Success" : "Failed",
      receiverName, 
      amountInUsd, 
      timestamp: new Date().toISOString(),
    });

    await sendNotification(
      userto._id,
      `${userIdTo} has sent you ${amount} coins`,
      "wallet"
    );
    await sendNotification(
      userIdFrom,
      `You sent ${amount} coins to ${userIdTo} `,
      "transaction"
    );

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

exports.getUserTransactionDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("wallet_address");
    if (!user || !user.wallet_address) {
      return res.status(404).json({
        success: false,
        message: "Wallet address not found for user",
      });
    }

    const walletAddress = user.wallet_address;

    const result = await Transaction.aggregate([
      {
        $match: {
          from: walletAddress,
        },
      },
      {
        $group: {
          _id: "$from",
          totalAmount: {
            $sum: {
              $toDouble: { $trim: { input: "$amount", chars: " ETH" } },
            },
          },
          totalFee: {
            $sum: {
              $toDouble: { $trim: { input: "$totalFee", chars: " ETH" } },
            },
          },
          totalGasUsed: {
            $sum: { $toInt: "$gasUsed" },
          },
          avgGasPrice: {
            $avg: {
              $toDouble: { $trim: { input: "$gasPrice", chars: " gwei" } },
            },
          },
          txCount: { $sum: 1 },
        },
      },
      {
        $project: {
          from: "$_id",
          _id: 0,
          fees: [
            { type: "totalAmount", value: "$totalAmount" },
            { type: "totalFee", value: "$totalFee" },
            { type: "totalGasUsed", value: "$totalGasUsed" },
            { type: "avgGasPrice", value: "$avgGasPrice" },
            { type: "txCount", value: "$txCount" },
          ],
        },
      },
    ]);
    const formattedFees = result[0]?.fees.map((fee) => ({
      type: fee.type,
      value: Number(fee.value.toFixed(12)),
    }));

    res.status(200).json({
      success: true,
      data: {
        from: result[0]?.from || walletAddress,
        fees: formattedFees,
      },
    });
  } catch (error) {
    console.error("Error in getUserTransactionDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching user's transaction summary",
    });
  }
};
