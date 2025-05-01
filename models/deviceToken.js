const mongoose = require("mongoose");

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: { type: String },
    deviceToken: { type: String, required: true },
    type: { type: String, required: true,enum:["ios", "android", ] }, 
  },
  { timestamps: true }
);
module.exports = mongoose.model("DeviceToken", deviceTokenSchema);
