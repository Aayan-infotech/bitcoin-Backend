const Transaction = require("../models/paymentRelated/TransactioModel")

async function saveTransactionReceipt(receipt) {
  const transaction = new Transaction(receipt);
  return await transaction.save();
}

module.exports = { saveTransactionReceipt };
