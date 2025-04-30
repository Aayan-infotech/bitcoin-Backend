const admin = require("firebase-admin");
const serviceAccount = require("./bitcoin-3a5a0-firebase-adminsdk-fbsvc-7b572f1d86.json"); // downloaded from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
