const Card = require("../../models/paymentRelated/UserCards");
const User = require("../../models/userModel");

exports.addCards = async (req, res) => {
  try {
    const { userId, cardType, cardNumber, expiry, cryptoAddress, nickname } =
      req.body;

    if (!userId || !cardType || (!cardNumber && !cryptoAddress)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const last4Digits = cardNumber ? cardNumber.slice(-4) : null;

    const newCard = new Card({
      userId,
      cardType,
      last4Digits,
      expiry,
      nickname,
      cryptoAddress: cardType === "Crypto" ? cryptoAddress : null,
    });

    await newCard.save();
    User.findByIdAndUpdate(
      userId,
      {
        $push: { linkedCards: newCard._id },
      },
      { new: true }
    );
    res
      .status(201)
      .json({ success: true, message: "Card added successfully", newCard });
  } catch (error) {
    return res.status(402).json({
      success: false,
      message: "error while adding card",
      error,
    });
  }
};

exports.linkWalletAddress = async (req, res) => {
  try {
    const { userId, walletAddress } = req.body;

    if (!userId || !walletAddress) {
      return res.status(400).json({ message: "Invalid request. Please Enter Full Details" });
    }

    await User.findByIdAndUpdate(userId, { cryptoWallet: walletAddress });

    res
      .status(200)
      .json({ success: true, message: "Wallet linked successfully" });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "error while linking wallet address",
      error,
    });
  }
};
