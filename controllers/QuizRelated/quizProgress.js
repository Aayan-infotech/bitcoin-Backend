const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const User = require("../../models/userModel");
const { sendNotification } = require("../../config/pushNotification");
const RewardClaimRequest = require("../../models/RewardClaimRequestModel");
const {
  getLevelFromPoints,
  getLevelProgress,
} = require("../../utils/getLevelFromPoints");

exports.startQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    if (!userId || !quizId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or quizId" });
    }

    const alreadyPassed = await QuizAttempt.findOne({
      quiz: quizId,
      user: userId,
      percentage: { $gte: 80 },
    });

    if (alreadyPassed) {
      return res.status(400).json({
        success: false,
        message:
          "You already passed this quiz with 80% or more. Re-attempt not allowed.",
      });
    }

    // ✅ Proceed with starting the quiz
    const newAttempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      score: 0,
      totalQuestions: 0,
      percentage: 0,
    });

    await newAttempt.save();

    res.status(201).json({
      success: true,
      message: "Quiz started",
      attempt: newAttempt,
    });
  } catch (error) {
    console.error("Start quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Error starting quiz",
      error: error.message,
    });
  }
};

exports.submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;

    if (!quizId || !userId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const fullQuiz = await Quiz.findById(quizId).populate("questions");
    if (!fullQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const correctAnswersMap = new Map(
      fullQuiz.questions.map((q) => [q._id.toString(), q.correctAnswer])
    );

    const totalQuestions = fullQuiz.questions.length || 1;
    const correctCount = answers.reduce(
      (acc, { questionId, selectedOption }) => {
        return correctAnswersMap.get(questionId) === selectedOption
          ? acc + 1
          : acc;
      },
      0
    );

    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    const maxPoints = fullQuiz.points || 10;
    const earnedPoints = Math.floor(
      (correctCount / totalQuestions) * maxPoints
    );

    await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      score: earnedPoints,
      totalQuestions,
      percentage,
    });

    const userDoc = await User.findById(userId);
    userDoc.quizPoints = (userDoc.quizPoints || 0) + earnedPoints;

    const videoPts = userDoc.videoPoints || 0;
    userDoc.totalPoints = userDoc.quizPoints + videoPts;

    const newLevel = getLevelFromPoints(userDoc.totalPoints);
    const leveledUp = newLevel > (userDoc.level || 1);
    if (leveledUp) userDoc.level = newLevel;

    await userDoc.save();

    sendNotification(
      userId,
      `You scored ${percentage}% on the quiz: ${fullQuiz.title}`,
      "promotional"
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score: earnedPoints,
      correctAnswers: correctCount,
      totalQuestions,
      percentage: `${percentage}%`,
      leveledUp,
      newLevel,
      totalPoints: userDoc.totalPoints,
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    return res.status(500).json({
      success: false,
      message: "Quiz submission failed",
      error: error.message,
    });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await QuizAttempt.find({ user: userId })
      .populate("quiz")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching progress", error });
  }
};

exports.claimQuizReward = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { quizId: quiz } = req.body;

    if (!quiz) {
      return res
        .status(400)
        .json({ success: false, message: "Quiz ID is required" });
    }

    const attempt = await QuizAttempt.findOne({ user: userId, quiz }).sort({
      createdAt: -1,
    });

    if (!attempt) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz attempt not found" });
    }

    const existingClaim = await RewardClaimRequest.findOne({
      user: userId,
      quiz,
    });

    if (existingClaim) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reward already claimed or pending approval.",
        });
    }

    const quizData = await Quiz.findById(quiz);
    const rewardAmount = quizData?.points || 5;

    await RewardClaimRequest.create({
      user: userId,
      quizId: quiz,
      attempt: attempt._id,
      score: attempt.score,
      rewardAmount,
      status: "Pending", // default
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
    const currentUserId = req.user.id;

    const topUsers = await User.find({ totalPoints: { $gt: 0 } })
      .sort({ totalPoints: -1 })
      .limit(10)
      .select("name image totalPoints");

    const leaderboard = topUsers.map((user) => ({
      userId: user._id,
      name: user.name,
      image: user.image,
      totalPoints: user.totalPoints,
      level: getLevelProgress(user.totalPoints).level,
    }));

    const currentUser = await User.findById(currentUserId).select(
      "totalPoints name image"
    );

    const currentUserStats = getLevelProgress(currentUser.totalPoints || 0);

    return res.status(200).json({
      success: true,
      leaderboard,
      currentUser: {
        userId: currentUser._id,
        name: currentUser.name,
        image: currentUser.image,
        ...currentUserStats,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
};


exports.yourLearningHub = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const lastAttempt = await QuizAttempt.findOne({ user: currentUserId })
      .sort({ createdAt: -1 })
      .populate("quiz");

    const allLatestAttempts = await QuizAttempt.aggregate([
      {
        $match: { user: req.user._id }, 
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$quiz", 
          quizId: { $first: "$quiz" },
          percentage: { $first: "$percentage" },
          score: { $first: "$score" },
          totalQuestions: { $first: "$totalQuestions" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "quizzes", 
          localField: "quizId",
          foreignField: "_id",
          as: "quiz",
        },
      },
      {
        $unwind: "$quiz",
      },
      {
        $project: {
          _id: 0,
          quizId: 1,
          percentage: 1,
          score: 1,
          totalQuestions: 1,
          createdAt: 1,
          quiz: {
            title: "$quiz.title",
            points: "$quiz.points",
            description: "$quiz.description",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      lastAttempt,
      latestAttemptsByQuiz: allLatestAttempts,
    });
  } catch (error) {
    console.error("Error fetching learning hub data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your learning hub data",
    });
  }
};
