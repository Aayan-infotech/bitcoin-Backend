const express = require('express');
const {  userSignup,login, verifyOtp, resetPassword, forgotPassword } = require('../controllers/authController')
const router = express.Router();


router.post('/signup', userSignup);
router.post('/verify-otp', verifyOtp,);
router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;    