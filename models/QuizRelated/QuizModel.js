const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type:String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], // Array of questions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, // Admin who created the quiz
  },
  { timeStamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
