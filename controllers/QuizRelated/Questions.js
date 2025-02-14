const Question = require("../../models/QuizRelated/QuestionsModel");
const Quiz = require("../../models/QuizRelated/QuizModel");

exports.addQuestionsToQuiz = async (req, res) => {
  try {
    const { quizId, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid questions array" });
    }

    const newQuestions = await Question.insertMany(questions);

    const questionIds = newQuestions.map((q) => q._id);

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $push: { questions: { $each: questionIds } } }, 
      { new: true, runValidators: true }
    ).populate("questions"); 

    res.status(201).json({
      success: true,
      message: "Questions added successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding questions",
      error,
    });
  }
};


exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });

    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching questions", error });
  }
};
