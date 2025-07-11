const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const User = require("../../models/userModel");
const { sendNotification } = require("../../config/pushNotification");
const RewardClaimRequest = require("../../models/RewardClaimRequestModel");
const { getLevelFromPoints } = require("../../utils/getLevelFromPoints");  

exports.startQuiz = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    const newAttempt = new QuizAttempt({
      user:userId,
      quiz:quizId,
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

    if (!quizId || !userId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const fullQuiz = await Quiz.findById(quizId).populate("questions");
    if (!fullQuiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const correctAnswersMap = new Map(
      fullQuiz.questions.map((q) => [q._id.toString(), q.correctAnswer])
    );

    const totalQuestions = fullQuiz.questions.length || 1;
    const correctCount = answers.reduce((acc, { questionId, selectedOption }) => {
      return correctAnswersMap.get(questionId) === selectedOption ? acc + 1 : acc;
    }, 0);

    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    const maxPoints = fullQuiz.points || 10;
    const earnedPoints = Math.floor((correctCount / totalQuestions) * maxPoints);

    await QuizAttempt.create({
      quiz:quizId,
      user:userId,
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
    res.status(500).json({ success: false, message: "Error fetching progress", error });
  }
};

exports.claimQuizReward = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { quizId:quiz} = req.body;

    if (!quiz) {
      return res.status(400).json({ success: false, message: "Quiz ID is required" });
    }

    const attempt = await QuizAttempt.findOne({ user: userId, quiz }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found" });
    }

    const existingClaim = await RewardClaimRequest.findOne({ user: userId, quiz });

    if (existingClaim) {
      return res.status(400).json({ success: false, message: "Reward already claimed or pending approval." });
    }

    const quizData = await Quiz.findById(quiz);
    const rewardAmount = quizData?.points || 5;

    await RewardClaimRequest.create({
      user: userId,
      quizId:quiz,
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
    const leaderboard = await QuizAttempt.aggregate([
      {
        $match: {
          user: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$totalQuestions" },
          attemptCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $multiply: [{ $divide: ["$totalScore", "$totalQuestions"] }, 100] }
            ],
          },
        },
      },
      { $sort: { percentage: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          image: "$user.image",
          totalScore: 1,
          totalQuestions: 1,
          percentage: { $round: ["$percentage", 2] },
          attemptCount: 1
        }
      }
    ]);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching leaderboard", error });
  }
};
