const crypto = require("crypto");
const algorithm = "aes-256-ctr"; // Keeping your preferred algorithm
const secretKey = Buffer.from('4f3d2c1b5a7e9f0182736475861928374f3d2c1b5a7e9f018273647586192837', "hex"); // 32-byte hex string from .env
 
function encrypt(text) {
  const iv = crypto.randomBytes(16); // IV should change every time
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
 
  return {
    content: encrypted.toString("hex"),
    iv: iv.toString("hex")
  };
}
 
function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final()
  ]);
  return decrypted.toString();
}
 
module.exports = { encrypt, decrypt };
 