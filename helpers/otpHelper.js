import {transport} from '../Config/EmailConfig.js'

const otpGenerator=()=>{
   return Math.floor(Math.random(999,10000)*10000)
}

const sendEmail = async (UserEmail,otp)=>{
 try{
   await transport.sendMail({
   from:"eseproject2025@gmail.com",
   to:UserEmail,
   subject:"OTP varification",
   text:`OTP ${otp}`
 })
 }catch(error)
 {
   console.log("error from admin otp send",error.message)
 }

 console.log("otp generated")
}


export default {
   otpGenerator,
   sendEmail
}