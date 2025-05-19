const fs = require('fs');
const file = 'users.json';

function loadUsers() {
  if (!fs.existsSync(file)) return [];
  const data = fs.readFileSync(file);
  return JSON.parse(data);
}

function saveUser(user) {
  const users = loadUsers();
  users.push(user);
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
}

function findUserByEmail(email) {
  const users = loadUsers();
  return users.find(u => u.email === email);
}

function saveTransactionReceipt(receipt) {
  const fs = require('fs');
  const file = 'transactions.json';
  const receipts = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  receipts.push(receipt);
  fs.writeFileSync(file, JSON.stringify(receipts, null, 2));
}

module.exports = { loadUsers, saveUser, findUserByEmail, saveTransactionReceipt };
