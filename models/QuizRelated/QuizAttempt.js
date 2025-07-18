const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correct: { type: Number},
    percentage: { type: Number, required: true },
    rewardClaimed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
