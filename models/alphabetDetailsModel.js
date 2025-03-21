const mongoose=require("mongoose")

const AlphabetDescription=new mongoose.Schema({
    alphabet:{
        type:String,
        required:true,
        trim:true
    },
    title:{
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
    },
    examples:{
        type:String,
    },
    relatedTerms:{
        type:String,
    }
})

module.exports=mongoose.model("Alphabet",AlphabetDescription)