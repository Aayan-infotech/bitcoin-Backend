const express = require('express');
const { createFAQ, getAllFAQs, getFAQById, updateFAQ, deleteFAQ } = require('../controllers/FaqControllers');
const { uploadToS3 } = require('../config/s3Setup');
const router = express.Router();

router.post('/create-faq',uploadToS3, createFAQ);
router.get('/get-all-faqs', getAllFAQs);
router.get('/get-faq-by-id/:id', getFAQById);
router.patch('/update-faq/:id', updateFAQ);
router.delete('/delete-faq/:id', deleteFAQ);

module.exports = router;
