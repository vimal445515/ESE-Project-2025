import user from "../../Service/userService.js"
import otp from "../../helpers/otpHelper.js"
import { generateReferralCode } from "../../helpers/referralCodeHelper.js";
import hash from "../../helpers/passwordHash.js";
import { User } from "../../Models/userSchema.js";
import userService from "../../Service/userService.js";
import productService from "../../Service/productService.js";
import product from "../product.js";
import passport from 'passport'
import addressService from "../../Service/addressService.js";
import orderSevice from "../../Service/orderSevice.js";
import walletController from "../walletController.js";
import walletService from "../../Service/walletService.js";
import { ConnectionClosedError } from "puppeteer";



const otpGenerator= async (req,res)=>{
    let {email,userName,password,phoneNumber = null,referralCode = null} = req.body;
   
    if(typeof email === 'object'){
    email = email[0];
  }
  if(typeof userName === 'object'){
    userName = userName[0];
    
  }
  if(typeof password === 'object'){
    password = password[0];
    
  }
  console.log(phoneNumber,typeof phoneNumber )
  console.log(referralCode,typeof referralCode)
   if(typeof phoneNumber === 'object'&& phoneNumber !== null){
    if(phoneNumber[0] !== ""){
       phoneNumber = phoneNumber[0];
    }
    else{
      phoneNumber = null
    }
   
    
  }
   if(typeof referralCode === 'object' && referralCode !== null  ){
    if(referralCode[0] !== ""){
       referralCode = referralCode[0];
    }else{
      referralCode = null
    }
   
    
  }
  
    req.session.email = email;
    req.session.tempUserName = userName;
    req.session.password = password
    req.session.phoneNumber = phoneNumber;
    req.session.referralCode = referralCode;
    const OTP = otp.otpGenerator();
    await user.clearOtp(email)
    await user.storeOtpInDb(email,OTP)
    otp.sendEmail(email,OTP);
    return res.status(200).render('User/otp',{email,userName,password,phoneNumber,referralCode })
}

const verifyOtp = async (req,res) => {
  const {otp} = req.body;
   const email = req.session.email
   const userName =  req.session.tempUserName
   const password =  req.session.password 
   const phoneNumber =  req.session.phoneNumber 
   const referralCode = req.session.referralCode;
  const result = await user.checkOtp(otp,email);
  
  
   if(result){
    const code =  generateReferralCode(userName)
    
    const userData =  await user.storeUserData(otp,userName,email,password,phoneNumber,referralCode,code,"user");
    await walletService.createWallet(userData._id)
    if(referralCode){
      await walletService.referralReward(userData._id,referralCode);
    }
     delete req.session.email
     delete req.session.tempUserName
     delete req.session.password 
     delete req.session.phoneNumber 
    return res.status(200).json({type:"success",href:"/login"});
  }
  return res.status(400).json({type:'error',message:"invalid OTP"});
}

const loadLoginPage = async(req,res) =>{
    await user.clearOtp(req.email)
    return res.status(200).render('User/login',{userName:null,status:null,message:null})
}

const authentication = async (req,res)=>{
  const {email,password}= req.body
  const data = await user.findUserFromDB(email)
  if(!data) return res.status(404).render('User/login',{userName:null,status:"error",message:"User Not found"});
  if(!hash.comparePassword(password,data.password)) return res.status(401).render("User/login",{userName:null,status:'error',message:"invaid password"});

  req.session.userName = data.userName
  req.session.email = data.email
  req.session.role = data.role
  req.session.phoneNumber  = data.phoneNumber;
  req.session.referralCode = data.referralId;
  req.session.profile = data.profile.url; 
  req.session._id = data._id
  req.session.save(() => {
    res.render("User/redirectHome");
   });
}
const loadSignupPage = (req,res)=>{
    res.render('User/sginup',{userName:null})
}

const loadHomePage=async(req,res)=>{
  const userName = req.session.userName||null  
  const data =  await user.getAllCategory()
  const newProducts = await productService.getNewProducts()
  const watches = await productService.getWatches()
  
  res.render('User/home',{userName,data,newProducts,watches,profile:req.session.profile});
} 

const findEmail= async (req,res,next)=>{
   const {email} = req.body
   const data = await user.findUserFromDB(email)
  if(!data) return res.status(404).json({status:"error",message:"User not found"});
  next()

}

const generateOtpForPasswordReset= async (req,res)=>{
  const {email} = req.body
  const OTP = otp.otpGenerator();
  await user.clearOtp(email)
  await user.storeOtpInDb(email,OTP)
  otp.sendEmail(email,OTP);
  req.session.email = email;
  res.status(200).json({status:"success",href:"/resetPassowrdOtp"});
  
}

const logout = (req,res)=>{
  if(req.session.adminRole){
     req.session.userName = null
    req.session.role = null
    req.session.email = null
    req.session.phoneNumber  = null
    res.redirect("/login");
  }else
  {
    req.session.destroy((err)=>{
    if(err) throw new Error("erorr in sesion distroy");
    res.status(200).redirect('/login')
  })
  }
}
const loadOtpPageForResetPassword = (req,res) =>{
  const {email} = req.session;
  res.render('User/otpResetPassword',{email,status:null,message:null});
}

const resetPasswordOtpVarification = async (req,res) =>{
  const {otp} = req.body
  const {email} = req.session

  const result = await user.checkOtp(otp,email);
 
  if(result) return res.json({type:"success",href:'/resetPasswordUser'})
  return res.status(400).json({type:'error',message:"invalid OTP"})

}

const loadresetPasswordPage = async (req,res)=>{
  res.status(200).render('User/resetPassword');
}
const resetPassword = async(req,res) =>{
 
  const {password} = req.body

  await userService.updatePassword(password,req.session.email)
  await user.clearOtp(req.session.email)
 req.session.destroy((err)=>{
    if(err) throw new Error("erorr in sesion distroy");
   
    res.status(200).redirect('/login')
  })

  
}


//passport google authenticate
 const startGoogleLogin = passport.authenticate('google',{
  scope:["profile","email"]
 })

 const googleAuthenticate = passport.authenticate('google',{
  failureRedirect:"/login"
 })

 const storeUserDataInSession=(req,res)=>{
  req.session.userName = req.user.userName
  req.session.email = req.user.email
  req.session.role = req.user.role
  req.session.phoneNumber  = req.user.phoneNumber;
  req.session._id = req.user._id
  req.session.profile = req.user.profile.url
  res.redirect('/home');
 }


const loadUserProfile= async(req,res)=>{
   const address = await addressService.getUserAddress(req.session._id)
   const orderData = await orderSevice.getOrderDataForDashbord(req.session._id); 
    res.render('User/userDashbord',{userName:req.session.userName,email:req.session.email,referralCode:req.session.referralCode,profile:req.session.profile,address,orderData})
}

const editProfile=(req,res)=>{
    
    res.render('User/userEditProfile',{userName:req.session.userName,email:req.session.email,phoneNumber:req.session.phoneNumber,profile:req.session.profile})
}

 const sendData = async(req,res,next)=>{
        delete req.session.newUserName
        delete req.session.newPhoneNumber
        delete req.session.newImageId
        delete req.session.newImageUrl  
        delete req.session.newEmail
      try{

     
      const data = await userService.verifyData(req.session,req.body?.userName,req.body?.email,req.body?.phoneNumber,req.file)
        if(data === "error"){
           return res.status(409).json({status:"error",message:"User alredy exists"});
        }
       
       if(data)
       { 
         const {email} = req.body
         const OTP = otp.otpGenerator();
         await user.clearOtp(email)    
         await user.storeOtpInDb(email,OTP)
         otp.sendEmail(email,OTP);
         return res.status(200).json({status:"success",href:"/profile/otp"})
       }
       else{
         await userService.updateUserData(req)
        res.status(200).json({status:"updated",message:"Data updated",href:"/EditUser"})
        
       }
        }catch(error){
          console.log("error from user profile edit",error)
          res.status(500).json({status:"error", message:"Something went wrong"})
        }
   
}

const resendOtp = async(req,res)=>{
  console.log("this is eail",req.session.newEmail)
         
    
         const OTP = otp.otpGenerator();
         await user.clearOtp(req.session.newEmail) 
         console.log("email is wrking",req.session.newEmail)   
         await user.storeOtpInDb(req.session.newEmail,OTP)
         otp.sendEmail(req.session.newEmail,OTP);
          res.render('User/emailUpdateOtpPage',{status:"success",message:null})
     
}

const loadOtpPageForUpdateEmail = (req,res)=>{
   res.render('User/emailUpdateOtpPage',{status:"success",message:null})
}

const verifyOptforUpdateEmail = async (req,res,next)=>{
  const email =req.session.newEmail
  try{


   const result = await user.checkOtp(req.body.otp,email);
   console.log("otp resllt",result)
   if(result){
   await userService.updateUserData(req)
    return res.status(200).json({type:'success',href:"/userProfile"})
   }else{
   return res.status(400).json({type:"error",message:"invalid otp"})
   }
     }catch(error){
       return res.status(500).json({type:"error",message:"Somthing was wrong"})
     }
}

const userProfileResetPassword =async(req,res)=>{
  const {currentPassword,newPassword} =req.body;
  const password = await userService.getCorrentPassword(req.session.email);
  if(await hash.comparePassword(currentPassword,password)){
    await userService.updatePassword(newPassword,req.session.email)
  }else
  {
   return res.status(401).json({status:"error",message:"invalid password"})
  }
  return res.status(200).json({status:"success",message:"password reseted successfully"});
  
}

   




export default {
    otpGenerator,
    verifyOtp,
    loadLoginPage,
    authentication,
    loadHomePage,
    logout,
    loadSignupPage,
    findEmail,
    generateOtpForPasswordReset,
    loadOtpPageForResetPassword,
    resetPasswordOtpVarification,
    resetPassword,
    startGoogleLogin,
    googleAuthenticate,
    storeUserDataInSession,
    loadUserProfile,
    editProfile,
    sendData,
    loadOtpPageForUpdateEmail,
    verifyOptforUpdateEmail,
    userProfileResetPassword,
     resendOtp,
     loadresetPasswordPage
    
}