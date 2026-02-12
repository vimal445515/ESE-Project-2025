import session from "express-session"
import adminService from "../../Service/adminService.js"
import otp from "../../helpers/otpHelper.js"
import user from '../../Service/userService.js'
import userService from "../../Service/userService.js"

const findEmail= async (req,res,next)=>{
   const {email} = req.body
   console.log("this is wrking")
  try{
   const data = await adminService.getAdminFromDB(email)
  if(!data) return res.status(404).json({status:"error",message:"User not found"});
  next()
  }catch(error){
    console.log(error)
    res.status(500).redirect("/500Error");
  }
}
const generateOtpForPasswordReset= async (req,res)=>{
  try{
  const {email} = req.body
  const OTP = otp.otpGenerator();
  await user.clearOtp(email)
  await user.storeOtpInDb(email,OTP)
  otp.sendEmail(email,OTP);
  req.session.email = email;
  res.status(200).json({status:"success",href:"/admin/resetPassowrdOtp"});
  }catch(error){
    res.status(500).json({type:"error",message:"Internal server Error"});
  }
}

const loadOtpPageForResetPassword = (req,res) =>{
  const {email} = req.session;
  req.session.email= null;
  res.render('Admin/otpResetPassword',{email,status:null,message:null});
}



 const resetPasswordOtpVarification = async (req,res) =>{

  const {otp} = req.body
  const {email} = req.body;
  try{
  const result = await user.checkOtp(otp,email);

  if(result){
    req.session.email = email
    return res.status(200).json({type:"success",href:"/admin/password"});
  } 
  res.status(400).json({type:"error",message:"invalid otp"})
  }catch(error){
    res.status(500).json({type:"error",message:"Internal server error"})
  }
}

const loadAdminPasswordChangePage = async(req,res)=>{
  res.status(200).render("Admin/resetPassword");
}
 const resetPassword = async(req,res) =>{
 
  const {password} = req.body
try{
  await userService.updatePassword(password,req.session.email)
  await user.clearOtp(req.session.email)
 req.session.destroy((err)=>{
    if(err) throw new Error("erorr in sesion distroy");
   
    res.status(200).redirect('/admin/login')
  })
  }catch(error){
    console.log(error)
    res.status(500).redirect('/500Error')
  }

  
}

export default  {
    findEmail,
    generateOtpForPasswordReset,
    loadOtpPageForResetPassword,
    resetPasswordOtpVarification,
    resetPassword,
    loadAdminPasswordChangePage
}