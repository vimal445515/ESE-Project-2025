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

export default {
    findUserFromDB,
    storeOtpInDb,
    storeUserData,
    checkOtp,
    clearOtp,
    getAllCategory,
    updatePassword

}