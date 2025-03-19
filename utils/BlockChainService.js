const { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://api.mainnet-beta.solana.com");


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