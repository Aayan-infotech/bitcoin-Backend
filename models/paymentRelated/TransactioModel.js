const mongoose = require("mongoose");

// const transactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   amount: { type: Number, required: true },
//   currency: { type: String, enum: ["crypto", "fiat"], required: true },
//   transactionType: {
//     type: String,
//     enum: ["deposit", "withdrawal", "payment", "reward"],
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "successful", "failed"],
//     default: "pending",
//   },
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Transaction", transactionSchema);
// const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionHash: { type: String, required: true },
    amount: { type: Number, required: true },
    gasFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
