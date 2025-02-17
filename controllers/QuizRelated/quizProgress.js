const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const Question = require("../../models/QuizRelated/QuestionsModel");

// Start a quiz attempt
exports.startQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    // Check if the user has already attempted the quiz
    const existingAttempt = await QuizAttempt.findOne({ userId, quizId });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: "Quiz already attempted" });
    }

    // Initialize a new quiz attempt
    const newAttempt = new QuizAttempt({
      userId,
      quizId,
      score: 0,
      totalQuestions: 0,
      percentage: 0,
    });

    await newAttempt.save();

    res.status(201).json({ success: true, message: "Quiz started", attempt: newAttempt });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error starting quiz", error });
  }
};

// Finish a quiz
exports.finishQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    const attempt = await QuizAttempt.findOne({ userId, quizId });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found" });
    }

    // Calculate percentage
    if (attempt.totalQuestions > 0) {
      attempt.percentage = (attempt.score / attempt.totalQuestions) * 100;
    }

    await attempt.save();

    res.status(200).json({ success: true, message: "Quiz completed", attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error finishing quiz", error });
  }
};

// Get a user's quiz progress
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizAttempt.find({ userId }).populate("quizId");

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching progress", error });
  }
};

// Get leaderboard (Top 10 users by score)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await QuizAttempt.find()
      .populate("userId", "name")
      .sort({ percentage: -1 })
      .limit(10);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching leaderboard", error });
  }
};
