const express=require("express")
const { getAllUsers } = require("../../controllers/userController")
const router=express.Router()

router.get("/get-all-user",getAllUsers)

module.exports=router