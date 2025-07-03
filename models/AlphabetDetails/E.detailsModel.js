const mongoose=require("mongoose")

const EDetails=new mongoose.Schema({
    headline:{
        type:String,
    },
    subHeadLine:{
        type:String
    },
    images:[String]

},{timestamps:true})

module.exports=mongoose.model("EDetails",EDetails)