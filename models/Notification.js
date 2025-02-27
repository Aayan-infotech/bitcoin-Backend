const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String,  },
    message: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "quiz_completion", "password_change"
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
