const express = require("express");
const {
  createQuiz,
  getQuizById,
  getAllQuizzes,
  deleteQuizById,
} = require("../../controllers/QuizRelated/QuizController");
const { uploadToS3 } = require("../../config/s3Setup");
const { auth } = require("../../middlewares/authMiddleware");
const {
  addQuestionsToQuiz,
  removeQuestionFromQuiz,
  deleteQuestion,
  updateQuestion,
} = require("../../controllers/QuizRelated/QuestionsController");
const {
  startQuiz,
  submitQuizAnswers,
  getUserAttempts,
  getLeaderboard,yourLearningHub
} = require("../../controllers/QuizRelated/quizProgress");
const router = express.Router();

// ********************************************
// Quiz CRUD Related Routes
// ********************************************
router.post("/create-quiz", uploadToS3, createQuiz);
router.get("/get-all-quizzes", getAllQuizzes);
router.get("/get-quizById/:id", getQuizById);
router.put("/remove-question-from-quiz", removeQuestionFromQuiz);
router.delete("/delete-quiz/:id", deleteQuizById);

// *****************************************
// quiz attempt related
// *****************************************
router.post("/start-quiz", startQuiz);
router.patch("/submit-answers", submitQuizAnswers);

// ********************************************
// question CRUD Related Routes
// ******************************************
router.post("/add-question/:quizId", addQuestionsToQuiz);
router.delete("/delete-question", deleteQuestion);
router.patch("/update-question/:questionId", updateQuestion);

// ********************************************
// Quiz progress Related Routes
// ********************************************

router.post("/get-user-progress/:userId", getUserAttempts);
router.get("/get-leaders", auth, getLeaderboard);
router.get("/get-learning-hub", auth, yourLearningHub);

module.exports = router;
