import {User} from '../Models/userSchema.js'
import {OtpModel} from "../Models/otpSchema.js"
import hash from "../helpers/passwordHash.js"
import {categoryModel} from '../Models/categorySchema.js'



const findUserFromDB= async (email) =>
{
    
    return await User.findOne({email:email,deleted:false,isBlocked:false});
}


const storeOtpInDb = async (email,otp) =>{
    const data = await OtpModel.insertOne({email:email,otp:otp,createdAt:new Date()})
    await data.save();
}

const checkOtp = async(otp,email) =>{
    
    const data = await OtpModel.findOne({email})
    console.log(" new "+otp,email+" old "+data.otp)
    if(otp == data.otp) return true;
    return false;

}

const storeUserData  = async (req,referralId,role)=>
{
    const {otp,userName,email,password,phoneNumber,referralCode} = req.body;
    const passwordHashed = hash.passwordHash(password);
    await User.create({userName,email,password:passwordHashed,phoneNumber,referralCode,referralId,role,isBlocked:false,createdAt:new Date(),deleted:false})
}

const clearOtp  = async (email)=>
{
    try{
        await OtpModel.deleteMany({email});
    }
    catch(error)
    {
        console.log("error from deleting exeisting otps")
    }
}
const getAllCategory = async ()=>{
    return await categoryModel.find({isBlocked:false})
}
const updatePassword = async(password,email)=>{
    const passwordHashed = hash.passwordHash(password);
    await User.findOneAndUpdate({email},{$set:{password:passwordHashed}})
}

const verifyData = async(session,userName,email,phoneNumber) =>{
    let flag = false;
    if( session.userName !== userName){
        session.newUserName=userName;
  
     }

    if(phoneNumber && phoneNumber !== session.phoneNumber)
     {
       
        session.newPhoneNumber = phoneNumber;
    }

     if(email !== session.email ){

       
         if(!await User.findOne({email:email})){
            flag= true
           session.newEmail =email;
       }
        else{
          return "error"
     }
    
   }
    return flag
   
}

const updateUserData = async (req)=>{
    let data = {}
    if(req.session.newEmail){
        data.email= req.session.newEmail;
       
    }
    
    if(req.session.newPhoneNumber){
        data.phoneNumber = req.session.newPhoneNumber
        
    }
    if(req.session.newUserName){
        data.userName = req.session.newUserName
    }
    delete req.session?.newEmail
    delete req.session?.newUserName
    delete req.session?.newPhoneNumber
     data = await User.findOneAndUpdate({email:req.session.email},{$set:data},{new:true})
    req.session.userName = data.userName;
    req.session.email = data.email
    req.session.phoneNumber = data.phoneNumber 
}

export default {
    findUserFromDB,
    storeOtpInDb,
    storeUserData,
    checkOtp,
    clearOtp,
    getAllCategory,
    updatePassword,
    verifyData,
    updateUserData

}