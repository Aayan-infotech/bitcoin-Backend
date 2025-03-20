const express = require("express");
const {
  createQuiz,
  getQuizById,
  getAllQuizzes,
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
  getLeaderboard,
} = require("../../controllers/QuizRelated/quizProgress");
const router = express.Router();

// ********************************************
// Quiz CRUD Related Routes
// ********************************************
router.post("/create-quiz", auth, uploadToS3, createQuiz);
router.get("/get-all-quizzes", getAllQuizzes);

router.get("/get-quizById/:id", getQuizById);
router.put("/remove-question-from-quiz", removeQuestionFromQuiz);

// *****************************************
// quiz attempt related
// *****************************************
router.post("/start-quiz", startQuiz);
router.post("/submit-answers", submitQuizAnswers);

// ********************************************
// question CRUD Related Routes
// ********************************************
router.post("/add-question/:quizId", addQuestionsToQuiz);
router.delete("/delete-question", deleteQuestion);
router.patch("/update-question/:questionId", updateQuestion);

// ********************************************
// Quiz progress Related Routes
// ********************************************

router.post("/get-user-progress/:userId", getUserAttempts);
router.post("/get-leaders", getLeaderboard);

module.exports = router;
