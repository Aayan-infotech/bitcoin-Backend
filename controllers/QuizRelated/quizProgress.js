const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const Question = require("../../models/QuizRelated/QuestionsModel");
const User = require("../../models/userModel");


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
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;

    if (!quizId || !userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const totalQuestions = Math.max(quiz.questions.length, 1);
    const correctAnswersMap = new Map(
      quiz.questions.map((q) => [q._id.toString(), q.correctAnswer])
    );

    // Calculate score
    const score = answers.reduce((acc, { questionId, selectedOption }) => {
      return correctAnswersMap.get(questionId) === selectedOption
        ? acc + 1
        : acc;
    }, 0);

    const percentage = ((score / totalQuestions) * 100).toFixed(2);

    // Store the user's attempt
    const quizAttempt = new QuizAttempt({
      quizId,
      userId,
      score,
      totalQuestions,
      percentage, // Store percentage in DB
    });

    await quizAttempt.save();
    global.sendNotification(userId, `You Scored ${percentage}%, while attempting the quiz: ${quiz.title}.`, "promotional")
    

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      totalQuestions,
      percentage: `${percentage}%`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error submitting quiz", error });
  }
};
// Get a user's quiz progress
exports.getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizAttempt.find({ userId }).populate("quizId").sort({ updatedAt: -1 })

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching progress", error });
  }
};

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
