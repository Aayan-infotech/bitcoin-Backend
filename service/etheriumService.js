const { ethers } = require("ethers");
require("dotenv").config();
const { getSecrets } = require("../config/awsSecrets");

let provider;
let secretsCache = null;

// Load secrets & initialize provider only once
async function init() {
  if (!secretsCache) {
    secretsCache = await getSecrets();

    provider = new ethers.providers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${secretsCache.INFURA_API}`
    );
  }
}

async function getUserWallet(userFromDecryptedKey) {
  await init();
  return new ethers.Wallet(userFromDecryptedKey, provider);
}
 
async function sendTransactionUser(userFromDecryptedKey, to, amountInEther) {
  const wallet = await getUserWallet(userFromDecryptedKey);
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amountInEther),
  });
  return tx;
}
// Create new random wallet
function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Get admin wallet
async function getAdminWallet() {
  await init();
  return new ethers.Wallet(secretsCache.ADMIN_PRIVATE_KEY, provider);
}

// Send Ether from admin to any address
async function sendTransaction(to, amountInEther) {
  const wallet = await getAdminWallet();
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amountInEther),
  });
  return tx;
}

// Get transaction details
async function getTransaction(txHash) {
  await init();
  return await provider.getTransaction(txHash);
}

// Get Ether balance
async function getBalance(address) {
  await init();
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

async function getProvider() {
  await init();
  if (!provider) throw new Error("Ethereum provider not initialized");
  return provider;
}

module.exports = {
  createWallet,
  sendTransaction,
  sendTransactionUser,
  getTransaction,
  getBalance,
  getProvider,
};

