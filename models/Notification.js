const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String },
    message: { type: String, required: true },
    type: { type: String, required: true,enum:["promotional", "wallet", "transaction", "security"] }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("Notification", notificationSchema);
