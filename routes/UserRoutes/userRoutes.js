const express=require("express")
const { getAllUsers, updateProfile, getDashboardData } = require("../../controllers/userController")
const { uploadToS3 } = require("../../config/s3Setup")
const { auth } = require("../../middlewares/authMiddleware")
const router=express.Router()

router.get("/get-all-user",getAllUsers)
router.patch("/update-profile/:id",uploadToS3,updateProfile)
// router.post("/verification-reminder/:userId",sendVerificationEmail)
router.get("/get-user-dashboard",auth,getDashboardData)

module.exports=router