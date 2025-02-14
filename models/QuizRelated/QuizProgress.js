const mongoose = require("mongoose");

const QuizProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  attemptedQuestions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

module.exports = mongoose.model("QuizProgress", QuizProgressSchema);
