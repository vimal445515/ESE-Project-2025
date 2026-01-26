import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    itemName:{
        type:String,
        required:true

    },
    offerType:{
        type:String,
        enum:['product','category'],
        required:true
    },
    targetId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        default:false
    },
    expiryDate:{
        type:Date,
        required:true
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

export default mongoose.model('offer',offerSchema);