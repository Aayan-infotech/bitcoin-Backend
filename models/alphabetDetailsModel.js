const mongoose=require("mongoose")

const AlphabetDescription=new mongoose.Schema({
    alphabet:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
        // required:true,
    },
    examples:{
        type:String,
    },
    relatedTerms:{
        type:String,
    }
})

module.exports=mongoose.model("Alphabet",AlphabetDescription)