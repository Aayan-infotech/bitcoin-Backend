const express = require("express");

const router = express.Router();

router.get('/alphabets', (req,res)=>{
    console.log("into the abcs")
    return res.status(200).json({
        success:true,
        message:"working fine!!"
    })
});


module.exports = router;
