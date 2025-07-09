const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const User = require("../../models/userModel");
const { sendNotification } = require("../../config/pushNotification");

// ✅ Create a new Quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit } = req.body;

    if (!req.fileLocations || !req.fileLocations[0]) {
      return res
        .status(400)
        .json({ success: false, message: "Image not found" });
    }

    const newQuiz = new Quiz({
      title,
      description,
      image: req.fileLocations[0],
      timeLimit,
      level,
      questions: [],
    });

    await newQuiz.save();

    // Notify all users
    const allUsers = await User.find({}, "_id");
    allUsers.forEach((user) =>
      sendNotification(
        user._id,
        `A new Quiz "${title}" has been added.`,
        "promotional"
      )
    );

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating quiz",
      error: error.message,
    });
  }
};

// ✅ Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select("-questions");
    res.status(200).json({
      success: true,
      quizzes,
      message: "Quizzes fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
      error: error.message,
    });
  }
};

// ✅ Get quiz by ID with questions
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
      error: error.message,
    });
  }
};

// ✅ Delete quiz by ID with questions
exports.deleteQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    await Question.deleteMany({ _id: { $in: quiz.questions } });
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz and its questions deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting quiz",
      error: error.message,
    });
  }
};

// ✅ Submit quiz & handle level-up logic
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, score } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Save or update quiz attempt
    let attempt = await QuizAttempt.findOne({ user: userId, quiz: quizId });
    if (!attempt) {
      attempt = new QuizAttempt({ user: userId, quiz: quizId, score });
    } else {
      attempt.score = score;
    }
    await attempt.save();

    // Check if user qualifies to level up
    const user = await User.findById(userId);
    user.quizPoints += score;
    user.totalPoints = user.quizPoints + user.videoPoints;

    const newLevel = getLevelFromPoints(user.totalPoints);
    const leveledUp = newLevel > user.level;

    if (leveledUp) {
      user.level = newLevel;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      newLevel: user.level,
      leveledUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting quiz",
      error: error.message,
    });
  }
};
