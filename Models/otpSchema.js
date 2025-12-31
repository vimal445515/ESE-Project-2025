import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        required:true,
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
    
})
otpSchema.index({createdAt:1},{
    expireAfterSeconds:120
});

export const OtpModel= mongoose.model("otp",otpSchema);