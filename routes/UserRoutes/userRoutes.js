const express=require("express")
const { getAllUsers, updateProfile, getDashboardData, getAllNotificationUsers, setMPIN, verifyMPIN, requestMPINReset, resetMPINWithOtp, getUserTransactionHistory } = require("../../controllers/userController")
const { uploadToS3 } = require("../../config/s3Setup")
const { auth } = require("../../middlewares/authMiddleware")
const { updateBiometric } = require("../../controllers/authController")
const { claimQuizReward } = require("../../controllers/QuizRelated/quizProgress")
const router=express.Router()

router.get("/get-all-user",getAllUsers)
router.get("/get-all-notification-user",getAllNotificationUsers)
router.put("/update-profile/:id",uploadToS3,updateProfile)
// router.post("/verification-reminder/:userId",sendVerificationEmail)
router.put("/update-mpin",auth,setMPIN)
router.get("/verify-mpin",auth,verifyMPIN)
router.post("/mpin/request-reset",auth, requestMPINReset);
router.post("/mpin/reset",auth, resetMPINWithOtp);
router.get("/get-user-dashboard",auth,getDashboardData)
router.put("/update-biometric",auth, updateBiometric);
router.get("/transaction-history",auth, getUserTransactionHistory);
router.post("/claim-reward", auth, claimQuizReward);

module.exports=router