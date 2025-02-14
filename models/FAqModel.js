const mongoose=require("mongoose")

const FAQ=new mongoose.Schema({
   question:{
    type:String,
    required:true,
   },
   answer:{
    type:String,
    required:true,
   }
})

module.exports=mongoose.model("FAQ",FAQ)