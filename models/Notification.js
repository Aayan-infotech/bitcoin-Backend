const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for broadcast
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Or "Admin" if separate model
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["promotional", "wallet", "transaction", "security"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    broadcastId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // null means it's not a broadcast
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-delete notifications after 7 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("Notification", notificationSchema);
