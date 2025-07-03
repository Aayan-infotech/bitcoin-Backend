const express=require("express")
const router=express.Router()
const { uploadToS3 } = require("../../../config/s3Setup")
const {createODetails,getAllODetails}=require("../../../controllers/AlphabetDetails/O.detailsController")

router.post("/create-oracle",uploadToS3,createODetails)
router.get("/get-oracle",getAllODetails)

module.exports=router;