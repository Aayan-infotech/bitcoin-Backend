const mongoose = require("mongoose");
MONGO_URL = "mongodb+srv://anuragyadav:4MttGnaem1H6sskw@cluster0.mpumx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const DB_URl = process.env.MONGO_URL||MONGO_URL;
exports.connectToDb = async () => {
  try {
    await mongoose.connect(DB_URl);
    console.log("connected to mongoDB Successfully");
  } catch (error) {
    console.log("Error while connecting to mongodb",error.message);

  }
};
