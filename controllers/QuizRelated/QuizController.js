const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");

// Create a new Quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, image, timeLimit } = req.body;
    console.log(req?.user)
    // const createdBy = req.user.id; // Assuming `req.user` contains admin ID

    const newQuiz = new Quiz({ title, description, image, timeLimit, questions: [] });
    await newQuiz.save();

    res.status(201).json({ success: true, message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Error creating quiz", error: error.message });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes", error: error.message });
  }
};

// Get a specific quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz", error: error.message });
  }
};
exports.removeQuestionFromQuiz = async (req, res) => {
    try {
      const { quizId, questionId } = req.body; // Get IDs from request params
  
      // Find the quiz and update by pulling the questionId from the questions array
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        { $pull: { questions: questionId } }, // Remove the questionId from the array
        { new: true } // Return the updated quiz
      ).populate("questions");
  
      if (!updatedQuiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Question removed successfully",
        quiz: updatedQuiz,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error removing question",
        error: error.message,
      });
    }
  };
  

