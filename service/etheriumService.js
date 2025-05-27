const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API}`
);
function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

function getAdminWallet() {
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
}

async function sendTransaction(to, amountInEther) {
  const wallet = getAdminWallet();
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amountInEther)
  });
  return tx;
}

async function getTransaction(txHash) {
  return await provider.getTransaction(txHash);
}

async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

module.exports = {
  createWallet,
  sendTransaction,
  getTransaction,
  getBalance,
  provider
};
