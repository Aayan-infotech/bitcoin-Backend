const Quiz = require("../../models/QuizRelated/QuizModel");
const Question = require("../../models/QuizRelated/QuestionsModel");
const QuizAttempt = require("../../models/QuizRelated/QuizAttempt");
const User = require("../../models/userModel");

// Create a new Quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, image, timeLimit } = req.body;
    console.log(req?.user);
    console.log(req.fileLocations)
    // const createdBy = req.user.id; // Assuming `req.user` contains admin ID

    const newQuiz = new Quiz({
      title,
      description,
      image:req.fileLocations[0],
      timeLimit,
      questions: [],
    });
    await newQuiz.save();
     const allUsers = await User.find({}, "_id"); // Fetch all users
        allUsers.forEach((user) =>
          global.sendNotification(user._id, `A new Quiz "${title}" has been added.`, "quiz")
        );

    res
      .status(201)
      .json({
        success: true,
        message: "Quiz created successfully",
        quiz: newQuiz,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
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
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching quiz",
        error: error.message,
      });
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
   const deletedQuestion= await Question.findByIdAndDelete(questionId)
    if (!updatedQuiz||!deletedQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Quiz or Question ID" });
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
// submit all the answers  
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;
    console.log(answers);

    if (!quizId || !userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Ensure totalQuestions is at least 1 to avoid division by zero
    const totalQuestions = Math.max(quiz.questions.length, 1);
    console.log("total Questions", totalQuestions);
    // Create a map of questionId -> correctAnswer for O(1) lookup
    const correctAnswersMap = new Map(
      quiz.questions.map((q) => [q._id.toString(), q.correctAnswer])
    );

    // Calculate score
    const score = answers.reduce((acc, { questionId, selectedOption }) => {
      return correctAnswersMap.get(questionId) === selectedOption
        ? acc + 1
        : acc;
    }, 0);

    // Calculate percentage (fix division by zero)
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
    global.sendNotification(userId, `You Scored ${percentage}%, while attempting the quiz: ${quiz.title}.`, "course")
    

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
