const admin = require("firebase-admin");
const serviceAccount = require("./coin01-ea8de-firebase-adminsdk-fbsvc-3f6c7ecef0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
