const express = require('express');
const { createFAQ, getAllFAQs, getFAQById, updateFAQ, deleteFAQ } = require('../controllers/FaqControllers');
const router = express.Router();

router.post('/create-faq', createFAQ);
router.get('/get-all-faqs', getAllFAQs);
router.get('/get-faq-by-id/:id', getFAQById);
router.put('/update-faq/:id', updateFAQ);
router.delete('/delete-faq/:id', deleteFAQ);

module.exports = router;
