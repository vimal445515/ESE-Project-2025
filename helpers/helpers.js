import fs from "fs"
import path from 'path'
import { fileURLToPath } from "url"
import {transport} from '../Config/EmailConfig.js'
import cloudinary from "../Config/cloudinary.js";
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

const deleteProfile = async(file)=>{
   await cloudinary.uploader.destroy(file.publicId);

}


const generateOrderId = () => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,""); 
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

const calculateAvargeRating = (reviews)=>{
  const sum= reviews.reduce((sum,review)=>{
      return sum+review.rating;
  },0)
   return sum/reviews.length;
}

const generateCouponCode = ()=>{
 const randomNumber  = Math.random().toString(36).substring(2, 8).toUpperCase().slice(1,4)
 const random =  Math.random().toString(36).substring(2, 8).toUpperCase().slice(1,4)
 return `COUPON-${random}-${randomNumber}`

}

const generateTransactionId = ()=>{
 return  `WALLET_TXN_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}
export default {
   otpGenerator,
   sendEmail,
   paginationSkip,
   groupValues,
   deleteProfile,
  generateOrderId,
  calculateAvargeRating,
  generateCouponCode,
  generateTransactionId
}
