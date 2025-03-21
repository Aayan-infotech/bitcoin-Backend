const Question = require("../../models/QuizRelated/QuestionsModel");
const Quiz = require("../../models/QuizRelated/QuizModel");

exports.addQuestionsToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid questions array" });
    }

    const createdQuestions = await Question.insertMany(questions);

    const questionIds = createdQuestions.map((q) => q._id);

    // Update the quiz with new questions
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $push: { questions: { $each: questionIds } } },
      { new: true, runValidators: true }
    ).populate("questions");

    if (!updatedQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({
      success: true,
      message: "Questions added successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding questions",
      error: error.message,
    });
  }
};
exports.removeQuestionFromQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.body; // Get IDs from request params

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $pull: { questions: questionId } }, // Remove the questionId from the array
      { new: true } // Return the updated quiz
    ).populate("questions");
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    if (!updatedQuiz || !deletedQuestion) {
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

exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, options, correctAnswer } = req.body;

    // Find and update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { text, options, correctAnswer },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating question",
      error: error.message,
    });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });

    res.status(200).json({ success: true, questions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching questions", error });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.body;
    // Find and delete the question
    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    await Quiz.updateMany(
      { questions: questionId }, 
      { $pull: { questions: questionId } } 
    );

    res.status(200).json({
      success: true,
      message: "Question deleted successfully and removed from quizzes",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting question",
      error: error.message,
    });
  }
};
