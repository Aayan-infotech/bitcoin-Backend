const express = require('express');
const {  userSignup,login, verifyOtp, resetPassword, forgotPassword,updatePassword } = require('../controllers/authController');
const { uploadToS3 } = require('../config/s3Setup');
const router = express.Router();


router.post('/signup',uploadToS3, userSignup);
router.post('/verify-otp', verifyOtp,);
router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);


module.exports = router;    