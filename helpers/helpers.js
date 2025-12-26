import fs from "fs"
import path from 'path'
import { fileURLToPath } from "url"
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


const paginationSkip = (page,limit)=>{
   return parseInt((page-1)*limit)
}
const groupValues = ()=>{

}

const deleteProfile = (file)=>{
    let __filename = fileURLToPath(import.meta.url);
     let __dirname =path.dirname(path.dirname(__filename))
     let root = __dirname.split("\\").join('/')
     if(fs.existsSync(`${root}/public/upload/${file}`)){
      fs.unlink(`${root}/public/upload/${file}`,(error)=>{
         console.log("profile Deleted");
      })
     }
}


const generateOrderId = () => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,""); 
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

export default {
   otpGenerator,
   sendEmail,
   paginationSkip,
   groupValues,
   deleteProfile,
  generateOrderId
}