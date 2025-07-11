const admin = require("firebase-admin");
const { getSecrets } = require("./awsSecrets");

const initializeFirebase = async () => {
  const secrets = await getSecrets();

  const firebaseConfig =
    typeof secrets.FIREBASE_CONFIG === "string"
      ? JSON.parse(secrets.FIREBASE_CONFIG)
      : secrets.FIREBASE_CONFIG;

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });

  console.log("✅ Firebase initialized");

  return admin;
};

module.exports = initializeFirebase();
