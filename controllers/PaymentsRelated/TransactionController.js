const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const Transaction = require("../models/Transaction");
const { sendTransaction } = require("../../utils/BlockChainService");
const { Connection, PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://api.mainnet-beta.solana.com");

const secretsManagerClient = new SecretsManagerClient({
  region: "your-region",
});
const getAdminPrivateKey = async () => {
  try {
    const secretName = "YourSecretName"; 
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await secretsManagerClient.send(command);

    if (!data.SecretString) {
      throw new Error("SecretString is empty");
    }

    const secrets = JSON.parse(data.SecretString);
    return secrets.ADMIN_WALLET_PRIVATE_KEY;
  } catch (err) {
    console.error("Error fetching secret:", err);
    throw new Error("Failed to fetch admin private key");
  }
};
const getTransactionDetails = async (transactionHash) => {
  const txDetails = await connection.getTransaction(transactionHash, { commitment: "confirmed" });

  if (!txDetails) throw new Error("Transaction not found!");

  const gasFee = txDetails.meta.fee / LAMPORTS_PER_SOL; 
  const status = txDetails.meta.err === null ? "success" : "failed"; 

  return { gasFee, status };
};
exports.sendCoins = async (req, res) => {
  try {
    const { userId, amount } = req.body;    
    const adminPrivateKey = await getAdminPrivateKey();    
    const transactionHash = await sendTransaction(adminPrivateKey, userId, amount);    
    const { gasFee, status } = await getTransactionDetails(transactionHash);    
    const transaction = new Transaction({
      userId,
      transactionHash,
      amount,
      gasFee,
      status,
    });
    await transaction.save();
    res.json({
      message: "Transaction successful",
      transactionHash,
      gasFee,
      status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};