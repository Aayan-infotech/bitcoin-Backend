const User = require("../../models/userModel");
const {
  sendTransaction,
  getTransaction,
  getBalance,
  provider,
} = require("../../service/etheriumService");
const { saveTransactionReceipt } = require("../../utils/fileStorage");
const { ethers } = require("ethers");
const { getSecrets } =require ("../../config/awsSecrets");
const secrets = await getSecrets();

exports.sendCoins = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User id of the user is required",
      });
    }
    if (!amount) {
      return res
        .status(400)
        .json({ error: "Amount is missing" });
    }
    const user =await User.findById(userId)

    const tx = await sendTransaction(user.wallet_address, amount);

    const receipt = await tx.wait();

    const gasPrice = await provider.getGasPrice();
    const gasUsed = receipt.gasUsed;
    const totalFee = gasPrice.mul(gasUsed); // BigNumber

    saveTransactionReceipt({
      from: tx.from,
      to:user.wallet_address,
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
  const balance = await getBalance(address);
  return balance;
};
exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.params;
    const balance = await getBalance(address);
    res.status(200).json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve balance" });
  }
};
