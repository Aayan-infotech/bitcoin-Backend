const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const User = require("../../models/userModel");
const Course = require("../../models/CourseRelated/CourseModel");

// Create a new Quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit } = req.body;
    if (!req.fileLocations[0]) {
      return res
        .status(402)
        .json({ success: false, message: "issue with image" });
    }

    const newQuiz = new Quiz({
      title,
      description,
      image: req.fileLocations[0],
      timeLimit,
      questions: [],
    });
    await newQuiz.save();
    const allUsers = await User.find({}, "_id"); // Fetch all users
    allUsers.forEach((user) =>
      global.sendNotification(
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

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json({
      success: true,
      quizzes,
      message: "Quizzes Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
      error: error.message,
    });
  }
};

// Get a specific quiz by ID
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

// submit all the answers
