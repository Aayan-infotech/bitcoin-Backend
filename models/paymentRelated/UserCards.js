const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardType: { type: String, enum: ["Credit", "Debit", "Crypto"], required: true },
  last4Digits: { type: String, required: true },
  expiry: { type: String, required: true },
  nickname: { type: String, default: "" },
  paymentGatewayId: { type: String }, // Stripe/MoonPay token (for traditional cards)
  cryptoAddress: { type: String }, // For crypto wallets
  createdAt: { type: Date, default: Date.now },
});

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;
