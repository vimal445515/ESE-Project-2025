import mongoose from "mongoose";


const reviewSchema  = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    profile:{
        type:String
    },
    productId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    productId:{
         type:mongoose.Types.ObjectId,
         require:true
    },
    rating:{
        type:Number
    },
    command:{
        type:String
    }
})

export default mongoose.model('review',reviewSchema);