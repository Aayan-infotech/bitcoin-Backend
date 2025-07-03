const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    level: { type: Number, required: true }, // 👈 NEW: Level of the quiz
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // ✅ typo fixed: timeStamps → timestamps
);

module.exports = mongoose.model("Quiz", QuizSchema);
