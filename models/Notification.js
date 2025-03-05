const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String },
    message: { type: String, required: true },
    type: { type: String, required: true }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create a TTL index on the createdAt field to remove documents after 7 days (604800 seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("Notification", notificationSchema);
