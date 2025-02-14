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
    const quiz = await Quiz.findById(req.params.quizId).populate("questions");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz", error: error.message });
  }
};

// Add questions to a Quiz
exports.addQuestionsToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body; // Expecting an array of question objects

    // Create and store new questions first
    const createdQuestions = await Question.insertMany(questions);

    // Extract question IDs
    const questionIds = createdQuestions.map(q => q._id);

    // Update the quiz with new questions
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $push: { questions: { $each: questionIds } } },
      { new: true, runValidators: true }
    ).populate("questions");

    if (!updatedQuiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, message: "Questions added successfully", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding questions", error: error.message });
  }
};
