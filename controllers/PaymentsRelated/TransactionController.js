const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const Transaction = require("../../models/paymentRelated/TransactioModel");
const { sendTransaction } = require("../../utils/BlockChainService");
const { Connection, PublicKey ,LAMPORTS_PER_SOL} = require("@solana/web3.js");

const connection = new Connection("https://api.mainnet-beta.solana.com");
// const connection = new Connection("https://api.devnet.solana.com");  /* for development purpose*/


const secretsManagerClient = new SecretsManagerClient({
  region: "us-east-1",
});
const getAdminPrivateKey = async () => {
  try {
    const secretName = "YourSecretName"; 
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await secretsManagerClient.send(command);

    if (!data.SecretString) {
      throw new Error("SecretString is empty");
    }
    let secrets;
    try {
      secrets = JSON.parse(data.SecretString);
    } catch (parseError) {
      throw new Error("Invalid JSON format in Secrets Manager");
    }
    if (!secrets.ADMIN_WALLET_PRIVATE_KEY) {
      throw new Error("Admin private key not found in Secrets Manager");
    }
    return secrets.ADMIN_WALLET_PRIVATE_KEY;
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "error while getting private key",
      error,
    });
  }
};
const getTransactionDetails = async (transactionHash) => {
  try {
    const txDetails = await connection.getTransaction(transactionHash, { commitment: "confirmed" });

    if (!txDetails) {
      throw new Error("Transaction not found!");
    }

    if (!txDetails.meta) {
      return { gasFee: 0, status: "pending" }; // Transaction is still processing
    }

    const gasFee = txDetails.meta.fee / LAMPORTS_PER_SOL;
    const status = txDetails.meta.err === null ? "success" : "failed";

    return { gasFee, status };
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "error while getting private key",
      error,
    });
  }
};

exports.sendCoins = async (req, res) => {
  try {
    const { userPublicKey, amount } = req.body;

    if (!userPublicKey || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input: userPublicKey and amount are required." });
    }

    const adminPrivateKey = await getAdminPrivateKey();
    const transactionHash = await sendTransaction(adminPrivateKey, userPublicKey, amount);
    const { gasFee, status } = await getTransactionDetails(transactionHash);

    const transaction = new Transaction({
      userPublicKey,
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
    return res.status(403).json({
      success: false,
      message: "error while sending coin",
      err,
    });
  }
};




