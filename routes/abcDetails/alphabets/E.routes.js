const express= require("express")
const { getAllEDetails,createEDetails } = require("../../../controllers/AlphabetDetails/E.detailsController")
const { uploadToS3 } = require("../../../config/s3Setup")

const router =express.Router()

router.post("/create-post",uploadToS3,createEDetails)
router.get("/get-post",getAllEDetails)

module.exports=router