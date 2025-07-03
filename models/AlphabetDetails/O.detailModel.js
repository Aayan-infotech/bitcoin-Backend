const mongoose=require("mongoose")

const ODetails=new mongoose.Schema({
    headline:{
        type:String,
    },
    subHeadLine:{
        type:String
    },
    video:[String]

},{timestamps:true})

module.exports=mongoose.model("ODetails",ODetails)