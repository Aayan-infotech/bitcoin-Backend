const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [String], // Multiple-choice options
  correctAnswer: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" }, // Question difficulty
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", QuestionSchema);
