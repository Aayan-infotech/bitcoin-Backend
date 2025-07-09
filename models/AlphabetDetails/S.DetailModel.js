const mongoose=require("mongoose")

const SDetails=new mongoose.Schema({
    video:[String]

},{timestamps:true})

module.exports=mongoose.model("SDetails",SDetails)