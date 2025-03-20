const { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const {
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
// const connection = new Connection("https://api.mainnet-beta.solana.com");   /* shanshank sir ka code*/
const connection = new Connection("https://api.devnet.solana.com");



exports.createWallet = () => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: keypair.secretKey.toString("hex"),
  };
};


exports.sendTransaction = async (fromPrivateKey, toPublicKey, amount) => {
  const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, "hex"));
  const toPublicKeyObj = new PublicKey(toPublicKey);

  const transaction = await connection.requestAirdrop(toPublicKeyObj, amount * LAMPORTS_PER_SOL);
  return transaction;
};
// below is my code for sending real solana coins   


exports.sendTransactions = async (fromPrivateKey, toPublicKey, amount) => {
  try {
    const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fromPrivateKey)));
    const toPublicKeyObj = new PublicKey(toPublicKey);

    // Create a transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Send & confirm transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);

    return { success: true, signature };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


