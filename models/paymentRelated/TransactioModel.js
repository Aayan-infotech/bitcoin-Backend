const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
  blockNumber: Number,
  gasUsed: String,
  gasPrice: String,
  totalFee: String,
  totalFeeValue: Number,
  amount: String,
  amountValue: Number,
  status: { type: String, enum: ['Success', 'Failed'] },
  receiverName: { type: String, required: false },
  amountInUsd: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
