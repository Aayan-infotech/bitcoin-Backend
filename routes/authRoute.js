const express = require('express');
const {  userSignup,login, verifyOtp, resetPassword, forgotPassword,updatePassword,saveDeviceToken } = require('../controllers/authController');
const { uploadToS3 } = require('../config/s3Setup');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: "Too many attempts from this IP, please try again later.",
});


router.post('/signup',rateLimiter,uploadToS3, userSignup);
router.post('/verify-otp', verifyOtp,);
router.post('/login',rateLimiter, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);
router.put("/save-device-token", saveDeviceToken);


module.exports = router;    