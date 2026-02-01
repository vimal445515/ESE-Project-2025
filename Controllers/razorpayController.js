// import {Router} from 'express'
// import razorpay from '../Config/razorpayConfig.js'
// import paymentModel from '../Models/paymentSchema.js'
// import mongoose from 'mongoose'
// import crypto from 'crypto'
// import orderSchema from '../Models/orderSchema.js'
// import { productModel } from '../Models/productSchema.js'
import razorpayService from "../Service/razorpayService.js";

const createOrderForRazorpay = async (req,res)=>{
    try{
  const productsOrderId = req.body.orderId
  const order = await razorpayService.createOrder(productsOrderId,req.session._id)

  res.json({
    orderId: order.id,
    amount: order.amount,
    keyId: process.env.RAZORPAY_KEY_ID
  });
    }catch(error){
        console.log(error);
       res.json({type:"error",message:"Somthing was wrong faild to perform action"}) 
    }
}


const varifyPaymentRazorpay = async(req,res)=>{
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
  } = req.body
try{
 const returnData = await razorpayService.varifyPayment(  razorpay_payment_id,razorpay_order_id,razorpay_signature)
 if( returnData.type === "success" ){
     res.status(200).json(returnData)
 }
 else{
    res.status(401).json(returnData);
 }

 }catch(error){
    console.log(error)
    res.status(500).json({type:'ServerError',message:"somthing was wrong payment varification faild"});
}

}





const razorpayPaymentFaild = async(req,res)=>{
    const {orderId} = req.body;
    const order = await razorpayService.paymentFaild(orderId);
    res.status(401).json({type:"error",message:"payment faild",href:`/orders/orderFailure?orderId=${orderId}&productOrderId=${order.orderId}&reason=${req.body.reson}`});
}


const retryPayment = async(req,res)=>{
  console.log("payment order id:",req.body.paymentOrderId)
  try{


 const order =  await razorpayService.getPaymentDetails(req.body.paymentOrderId,req.body.productOrderId);

 const {amount,paymentOrderId,currency} = order
 res.status(200).json({type:"success",amount,paymentOrderId,currency,keyId:process.env.RAZORPAY_KEY_ID})
   }catch(error){
    console.log(error)
    if(error.message.includes('Out of Stock')){
      
       res.status(400).json({type:"stockError",message:error.message})
    }
    else{
      res.status(500).json({type:"ServerError",message:"somthing was wrong"});
    }
   }
}



export default{
    createOrderForRazorpay,
    varifyPaymentRazorpay,
    razorpayPaymentFaild,
    retryPayment
}