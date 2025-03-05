const express=require("express")
const { getAllUsers, updateProfile } = require("../../controllers/userController")
const { uploadToS3 } = require("../../config/s3Setup")
const router=express.Router()

router.get("/get-all-user",getAllUsers)
router.patch("/update-profile/:id",uploadToS3,updateProfile)

module.exports=router