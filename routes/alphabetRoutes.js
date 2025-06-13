const express = require('express');
const { createAlphabet,getAllAlphabets,getAlphabetById, updateAlphabet, deleteAlphabet} = require('../controllers/AlphabetController')
const {uploadToS3}=require("../config/s3Setup")
const router = express.Router()


router.post('/create-alphabet',uploadToS3, createAlphabet);
router.get('/get-all-alphabet', getAllAlphabets);
router.get('/get-alphabet-by-id/:id', getAlphabetById);
router.patch('/update-alphabet/:id',uploadToS3, updateAlphabet);
router.delete('/delete-alphabet/:id', deleteAlphabet);

module.exports = router;    