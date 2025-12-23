import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true,
    },
    companyName:{
        type:String,
        require:false
    },
    country:{
        type:String,
        require:true
    },
    state:{
        type:String,
        require:true
    },
    city:{
        require:true,
        type:String
    },
    pinCode:{
        require:true,
        type:Number
    },
    email:{
        type:String,
        require:true
    }, 
    address:{
        type:String,
        require:true
    },
    phoneNumber:{
        type:Number,
        require:true
    },
    userId:{
        type:String,
        require:true
    },
    default:{
        type:Boolean,
        unique:true
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

export default mongoose.model("address",addressSchema)