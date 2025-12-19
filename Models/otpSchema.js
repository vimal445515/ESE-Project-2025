import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    otp:{
        require:true,
        type:String
    },
    createdAt:{
        type:Date
    }
    
})

export const OtpModel= mongoose.model("otp",otpSchema);