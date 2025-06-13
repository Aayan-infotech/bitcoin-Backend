const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const Quiz = require("../../models/QuizRelated/QuizModel");
const User = require("../../models/userModel");
const { sendNotification } = require("../../config/pushNotification");
const RewardClaimRequest = require("../../models/RewardClaimRequestModel");

// Start a quiz attempt
exports.startQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    // Check if the user has already attempted the quiz
    // const existingAttempt = await QuizAttempt.findOne({ userId, quizId });
    // if (existingAttempt) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Quiz already attempted" });
    // }

    // Initialize a new quiz attempt
    const newAttempt = new QuizAttempt({
      userId,
      quizId,
      score: 0,
      totalQuestions: 0,
      percentage: 0,
    });

    await newAttempt.save();

    res
      .status(201)
      .json({ success: true, message: "Quiz started", attempt: newAttempt });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error starting quiz", error });
  }
};
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;
    const existingAttempt = await QuizAttempt.findOne({ userId, quizId });
    // if (existingAttempt) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Quiz already attempted" });
    // }

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
    sendNotification(
      userId,
      `You Scored ${percentage}%, while attempting the quiz: ${quiz.title}.`,
      "promotional"
    );
    await User.findByIdAndUpdate(userId, {
      $inc: { quizPoints: score },
    });

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      totalQuestions,
      correctAnswers: score,
      pointsEarned: score,
      wrongAnswers: totalQuestions - score,
      percentage: `${percentage}%`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting quiz",
      error: error.message,
    });
  }
};
// Get a user's quiz progress
exports.getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await QuizAttempt.find({ userId })
      .populate("quizId")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching progress", error });
  }
}; // controllers/quizController.js

exports.claimQuizReward = async (req, res) => {
  try {
    const userId = req.user.id;
    // const userId = "67ab32f7f4a584223231f305";
    const { quizId } = req.body;

    if (!quizId) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz ID is required" });
    }

    const attempt = await QuizAttempt.findOne({ userId, quizId });

    if (!attempt) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz attempt not found" });
    }
    // ****************************** to be uncommented when everything is tested*************************

    // if (attempt.rewardClaimed) {
    //   return res.status(400).json({ success: false, message: "Reward already claimed" });
    // }

    // const existingClaim = await RewardClaimRequest.findOne({ user: userId, quizId });
    // if (existingClaim) {
    //   return res.status(400).json({ success: false, message: "Reward claim already requested" });
    // }

    await RewardClaimRequest.create({
      user: userId,
      quizId,
      score: attempt.score,
    });

    res.status(200).json({
      success: true,
      message: "Reward claim submitted for admin approval.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to submit reward claim",
      error: err.message,
    });
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
    res
      .status(500)
      .json({ success: false, message: "Error fetching leaderboard", error });
  }
};
