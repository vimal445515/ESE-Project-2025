import user from "../../Service/userService.js"
import otp from "../../helpers/otpHelper.js"
import { generateReferralCode } from "../../helpers/referralCodeHelper.js";
import hash from "../../helpers/passwordHash.js";
import { User } from "../../Models/userSchema.js";
import userService from "../../Service/userService.js";
import productService from "../../Service/productService.js";
import product from "../product.js";
import passport from 'passport'


const otpGenerator= async (req,res)=>{
    const {email,userName,password,phoneNumber = null,referralCode = null} = req.body;
    const OTP = otp.otpGenerator();
    await user.clearOtp(email)
    await user.storeOtpInDb(email,OTP)
    otp.sendEmail(email,OTP);
    return res.status(200).render('User/otp',{userName,email,password,phoneNumber,referralCode,status:null,message:null})
}

const verifyOtp = async (req,res) => {
  const {otp,userName,email,password,phoneNumber,referralCode} = req.body;
  console.log(otp,userName,email,password,phoneNumber,referralCode)
  const result = await user.checkOtp(otp,email);

   if(result){
    const code =  generateReferralCode(userName)
    await user.storeUserData(req,code,"user");
    return res.status(200).redirect('/login');
  }
  return res.status(400).render('User/otp',{userName,email,password,phoneNumber,referralCode,status:"error",message:"invalid OTP"});
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

  console.log(req.session.userName);
  return res.status(200).redirect("/home");
}
const loadSignupPage = (req,res)=>{
    res.render('User/sginup',{userName:null})
}

const loadHomePage=async(req,res)=>{
  const userName = req.session.userName||null  
  const data =  await user.getAllCategory()
  const newProducts = await productService.getNewProducts()
  const watches = await productService.getWatches()

  res.render('User/home',{userName,data,newProducts,watches});
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
 
  if(result) return res.render('User/resetPassword')
  return res.status(400).render('User/otpResetPassword',{email,status:"error",message:"invalid OTP"});

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
  res.redirect('/home');
 }


const loadUserProfile=(req,res)=>{
    res.render('User/userDashbord',{userName:req.session.userName,email:req.session.email,referralCode:req.session.referralCode})
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
    loadUserProfile
}