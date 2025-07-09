const express=require("express");
const { createSatoshi,getSatoshi } = require("../../../controllers/AlphabetDetails/S.detailController");
const router=express.Router();
const {uploadToS3}=require("../../../config/s3Setup")

 router.put("/update-satoshi",uploadToS3,createSatoshi)
 router.get("/get-satoshi",getSatoshi)

 module.exports=router