const express = require('express');
const { createQuiz,getQuizById,getAllQuizzes, removeQuestionFromQuiz} = require('../../controllers/QuizRelated/QuizController')
const {uploadToS3}=require("../../config/s3Setup")
const {authMiddleware}=require("../../middlewares/authMiddleware")
const { addQuestionsToQuiz, deleteQuestion, updateQuestion} = require('../../controllers/QuizRelated/QuestionsController')
const router = express.Router()


// ********************************************
// Quiz Related Routes 
// ********************************************
router.post('/create-quiz',uploadToS3, createQuiz);
router.get('/get-quizById/:id', getQuizById);
router.put('/remove-question-from-quiz', removeQuestionFromQuiz);



// ********************************************
// question Related Routes
// ********************************************
router.post('/add-question', addQuestionsToQuiz);
router.delete('/delete-question', deleteQuestion);
router.patch('/update-question/:questionId', updateQuestion);   

module.exports = router;    