const express=require("express")
const { getAllUsers, updateProfile, getDashboardData, getAllNotificationUsers } = require("../../controllers/userController")
const { uploadToS3 } = require("../../config/s3Setup")
const { auth } = require("../../middlewares/authMiddleware")
const { updateBiometric } = require("../../controllers/authController")
const router=express.Router()

router.get("/get-all-user",getAllUsers)
router.get("/get-all-notification-user",getAllNotificationUsers)
router.put("/update-profile/:id",uploadToS3,updateProfile)
// router.post("/verification-reminder/:userId",sendVerificationEmail)
router.get("/get-user-dashboard",auth,getDashboardData)
router.put("/update-biometric",auth, updateBiometric);

module.exports=router