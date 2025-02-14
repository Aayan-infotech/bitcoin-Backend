const QuizProgress = require("../models/QuizProgress");
const Question = require("../models/Question");

exports.startQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    const existingProgress = await QuizProgress.findOne({ userId, quizId });
    if (existingProgress) {
      return res.status(400).json({ success: false, message: "Quiz already started/completed" });
    }

    const newProgress = new QuizProgress({ userId, quizId, attemptedQuestions: [] });
    await newProgress.save();

    res.status(201).json({ success: true, message: "Quiz started", progress: newProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error starting quiz", error });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { userId, quizId, questionId, selectedAnswer } = req.body;

    const progress = await QuizProgress.findOne({ userId, quizId });
    if (!progress) {
      return res.status(404).json({ success: false, message: "Quiz progress not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    progress.attemptedQuestions.push({ questionId, selectedAnswer, isCorrect });

    if (isCorrect) progress.score += 1;
    await progress.save();

    res.status(200).json({ success: true, message: "Answer submitted", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting answer", error });
  }
};

exports.finishQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    const progress = await QuizProgress.findOneAndUpdate(
      { userId, quizId },
      { completed: true, completedAt: new Date() },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ success: false, message: "Quiz progress not found" });
    }

    res.status(200).json({ success: true, message: "Quiz completed", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error finishing quiz", error });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizProgress.find({ userId }).populate("quizId");

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching progress", error });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await QuizProgress.find({ completed: true })
      .populate("userId", "name")
      .sort({ score: -1 })
      .limit(10);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching leaderboard", error });
  }
};
