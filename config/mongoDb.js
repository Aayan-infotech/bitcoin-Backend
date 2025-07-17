const mongoose = require("mongoose");
const { getSecrets } = require("./awsSecrets");

exports.connectToDb = async () => {
  const secrets = await getSecrets(); // ✅ Await here
  try {
    await mongoose.connect(secrets.MONGO_URL);
    console.log("Connected to MongoDB Successfully");
  } catch (error) {
    console.error("Error while connecting to MongoDB:", error);
  }
};
