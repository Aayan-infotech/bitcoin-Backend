const express = require('express');
const { createQuiz,addQuestionsToQuiz,getQuizById,getAllQuizzes} = require('../../controllers/QuizRelated/QuizController')
const {uploadToS3}=require("../../config/s3Setup")
const router = express.Router()


router.post('/create-quiz',uploadToS3, createQuiz);

module.exports = router;    