const express = require('express');
const { createAlphabet,getAllAlphabets,getAlphabetById} = require('../controllers/AlphabetController')
const {uploadToS3}=require("../config/s3Setup")
const router = express.Router()


router.post('/create-alphabet',uploadToS3, createAlphabet);
router.get('/get-all-alphabet', getAllAlphabets);
router.get('/get-alphabet-by-id/:id', getAlphabetById);

module.exports = router;    