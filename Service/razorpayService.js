
import razorpay from '../Config/razorpayConfig.js'
import paymentModel from '../Models/paymentSchema.js'
import mongoose from 'mongoose'
import crypto from 'crypto'
import orderSchema from '../Models/orderSchema.js'
import { productModel } from '../Models/productSchema.js'
import orderModel from '../Models/orderSchema.js'


const createOrder = async(productsOrderId,_id)=>{
    const productsOrder = await orderSchema.findOne({orderId:productsOrderId})
      const order = await razorpay.orders.create({
        amount: Math.round((Number(productsOrder.pricing.totalAmount.toFixed(2))*100)), 
        currency: "INR",
        notes:{
          useId:_id,
         }
      });
      console.log(order)
      productsOrder.payment.paymentOrderId = order.id;
      await productsOrder.save()
      await paymentModel.create({
      userId:new mongoose.Types.ObjectId(_id),
      amount:order.amount,
      currency:order.currency,
      paymentOrderId:order.id,
    })
    return order;
}

const varifyPayment = async(razorpay_payment_id,razorpay_order_id,razorpay_signature)=>{
    const body = razorpay_order_id+ "|" +razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex')
    const order = await orderSchema.findOne({'payment.paymentOrderId':razorpay_order_id})
    const payment =  await paymentModel.findOne({paymentOrderId:razorpay_order_id})
    if(razorpay_signature === expectedSignature){
    if(order.orderStatus === 'paymentFailed'){
       for(let item of order.items){
       await productModel.updateOne({_id:new mongoose.Types.ObjectId(item.productId)},{$inc:{'variants.$[v].stock':-Number(item.quantity)}},{arrayFilters:[{'v._id':new mongoose.Types.ObjectId(item.variantId)}]})
    }
    }
   order.status = 'paid'
   order.payment.status = 'paid'
   order.orderStatus = 'placed'
   
   await order.save();
   await payment.save();

   
    return {type:"success",href:`/orders/orderSuccess?orderId=${order.orderId}`}
   

  }else{
    if(order.orderStatus !== "paymentFailed"){
       order.payment.status = 'failed'
     order.orderStatus = 'paymentFailed'
      for(let item of order.items){
      await productModel.updateOne({_id:new mongoose.Types.ObjectId(item.productId)},{$inc:{'variants.$[v].stock':Number(item.quantity)}},{arrayFilters:[{'v._id':new mongoose.Types.ObjectId(item.variantId)}]})
    }
    }
     await order.save()
     return {type:"error",message:"payment faild",href:`/orders/orderFailure?orderId=${payment.orderId}&productOrderId=${order.orderId}$reason=somthing was wroing!`}
    
  }

}


const paymentFaild = async (paymentOrderId)=>{
    const order = await orderSchema.findOne({'payment.paymentOrderId':paymentOrderId})
  if(order.orderStatus !== "paymentFailed"){
   order.payment.status = 'failed'
    order.orderStatus = 'paymentFailed'
     for(let item of order.items){
     await productModel.updateOne({_id:new mongoose.Types.ObjectId(item.productId)},{$inc:{'variants.$[v].stock':Number(item.quantity)}},{arrayFilters:[{'v._id':new mongoose.Types.ObjectId(item.variantId)}]})
    }
  }
    await order.save()
    return order;
}

const getPaymentDetails = async(paymentOrderId,productOrderId)=>{
  console.log("thisis tne target",productOrderId);
  const orderItems = await orderModel.aggregate([
    {$match:{orderId:productOrderId}},
    {$unwind:'$items'}
  ]);
  console.log(orderItems);
  for(let orderItem of orderItems){
   let product =  await productModel.aggregate([
      {$match:{_id:orderItem.items.productId}},
      {$unwind:"$variants"},
      {$match:{'variants._id':orderItem.items.variantId}}
    ])
    console.log("expected:",product[0].variants,orderItem.items)
    if(product[0].variants.stock < orderItem.items.quantity) {
      throw new Error(`${product[0].productName}:Out of Stock`)
    }
  }


  const  data =  await paymentModel.findOne({paymentOrderId:paymentOrderId})
  return data;
}


export default{
     createOrder,
     varifyPayment,
     paymentFaild,
     getPaymentDetails
}