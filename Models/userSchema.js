import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String
       
    },
    referralId:{
        type:String,
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    phoneNumber:{
        type:Number
    },
    referralCode:{
        type:String
    },
    isBlocked:{
        type:Boolean
    },
    createdAt:{
        type:Date
    },
    deleted:{
        type:Boolean
    },
    googleId:{
        type:String
    },
    profile:{
        type:String
    }
    
})

export  const User = mongoose.model("user",userSchema)
 