const mongoose = require("mongoose");

const DB_URl = process.env.MONGO_URL;
exports.connectToDb = async () => {
  try {
    await mongoose.connect(DB_URl);
    console.log("connected to mongoDB Successfully");
  } catch (error) {
    console.log("Error while connecting to mongodb",error.message);

  }
};
