import {Router} from 'express'
import razorpay from '../Config/razorpayConfig.js'
import paymentModel from '../Models/paymentSchema.js'
import mongoose from 'mongoose'
import crypto from 'crypto'
import orderSchema from '../Models/orderSchema.js'

const router = Router()

router.post('/createOrder',async (req,res)=>{
  const productsOrderId = req.body.orderId
  const productsOrder = await orderSchema.findOne({orderId:productsOrderId})


  const order = await razorpay.orders.create({
    amount: productsOrder.pricing.totalAmount*100, 
    currency: "INR",
    notes:{
      useId:req.session._id,
     }
  });

  productsOrder.payment.paymentOrderId = order.id;
  await productsOrder.save()
  await paymentModel.create({
  userId:new mongoose.Types.ObjectId(req.session._id),
  amount:order.amount,
  currency:order.currency,
  paymentOrderId:order.id,
})


  res.json({
    orderId: order.id,
    amount: order.amount,
    keyId: process.env.RAZORPAY_KEY_ID
  });
})


router.post('/varifyPayment',async(req,res)=>{
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
  } = req.body


  const body = razorpay_order_id+ "|" +razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex')
const order = await orderSchema.findOne({'payment.paymentOrderId':razorpay_order_id})
const payment =  await paymentModel.findOne({paymentOrderId:razorpay_order_id})
  if(razorpay_signature === expectedSignature){

   order.status = 'paid'
   order.payment.status = 'paid'
   order.orderStatus = 'placed'
   await order.save();
   await payment.save();
    res.status(200).json({type:"success",href:`/orders/orderSuccess?orderId=${order.orderId}`})

  }else{
     order.payment.status = 'failed'
     order.orderStatus = 'paymentFailed'
     await order.save()
    res.status(401).json({type:"error",message:"payment faild",href:`orders/orderFailure?orderId=${payment.orderId}&productOrderId=${order.orderId}$reason=somthing was wroing!`});
  }


})

router.post('/paymentFaild',async(req,res)=>{
  const order = await orderSchema.findOne({'payment.paymentOrderId':req.body.orderId})
   order.payment.status = 'failed'
    order.orderStatus = 'paymentFailed'
    await order.save()
    res.status(401).json({type:"error",message:"payment faild",href:`orders/orderFailure?orderId=${req.body.orderId}&productOrderId=${order.orderId}&reason=${req.body.reson}`});
})

router.post('/oldOrderId',async(req,res)=>{
  console.log(req.body.paymentOrderId)
 const order =  await paymentModel.findOne({paymentOrderId:req.body.paymentOrderId})
 console.log(order)
 const {amount,paymentOrderId,currency} = order
 res.status(200).json({type:"success",amount,paymentOrderId,currency,keyId:process.env.RAZORPAY_KEY_ID})
})

export default router