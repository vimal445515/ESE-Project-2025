import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'
import {productModel} from '../Models/productSchema.js'
import helper from '../helpers/helpers.js'
import cartModel from '../Models/cartSchema.js'
import addressModel from '../Models/addressSchema.js'
import orderReturnModel from "../Models/orderReturnSchema.js"
import wishlistModel from '../Models/wishlistSchema.js'
import cartService from './cartService.js'
import { couponModel,couponUseCount } from '../Models/couponSchema.js'
import walletService from './walletService.js'
import { walletModel,walletTransaction } from '../Models/walletSchema.js'
import helpers from '../helpers/helpers.js'

const orderSingleProduct = async(productId,variantId,quantity,userId,productName,generalPhoto,paymentMethod,reqObj,orderDetails,price,discount,productFinalPrice,coupon=null,orderStatus='placed')=>{

    
    if(paymentMethod==='wallet'){
        
        const wallet = await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)});
        
        if(wallet.balance < orderDetails.total){
            throw new Error('"Your wallet balance is less than the order total. Please use another payment method ');
        }else{
            wallet.balance = wallet.balance-orderDetails.total;
            await wallet.save();

             let transactionId = helpers.generateTransactionId()
                await walletTransaction.create({
                    transactionId:transactionId,
                    userId:new mongoose.Types.ObjectId(userId),
                    amount:orderDetails.total,
                    type:"debit",
                    orderId:null
                })
        }
    }

    //store address
    await addressModel.create()

    // Reduce stock

    
        await productModel.findOneAndUpdate(
        {_id: new mongoose.Types.ObjectId(productId)},
        {$inc:{'variants.$[variant].stock':-Number(quantity)}},
        {arrayFilters:[
            {'variant._id':variantId}
        ]}
    )
   
    

    let couponData
    if(coupon){
       couponData =  await couponModel.findOne({couponCode:coupon})
       couponData = {
        couponCode:couponData.couponCode,
        discount:couponData.discount,
        maximumDiscount:couponData.maximumDiscount,
        minimumOrder:couponData.minimumOrder
       }
        await couponUseCount.create({userId,couponCode:coupon})
    }
    else{
        couponData = null;
    }

    //create order
    const orderId = helper.generateOrderId()
    const data = await orderModel.create({
        userId:userId,
        orderId:orderId,
        items:[
            {
                productId:productId,
                variantId:variantId,
                quantity:quantity,
                finalPrice:Number(productFinalPrice+((18/100)*productFinalPrice)),
                productName:productName,
                price:parseInt(price-((discount/100)*price)),
                image:generalPhoto?.url,
                
            }
        ],
        payment:{
            method:paymentMethod,
            status:paymentMethod==="wallet"?"paid":'pending'
        },
        address:{
            userName:reqObj.userName,
            companyName:reqObj.companyName,
            address:reqObj.address,
            pinCode:reqObj.pinCode,
            country:reqObj.country,
            state:reqObj.state,
            district:reqObj.city,
            email:reqObj.email,
            phoneNumber:reqObj.phoneNumber
        },
        pricing:{
            subTotal:orderDetails.totalPriceCartItem,
            discount:orderDetails.totalDiscountPrice,
            offerDiscount:orderDetails.offerDiscount,
            couponDiscount:orderDetails?.couponDiscount?orderDetails.couponDiscount:0,
            tax:orderDetails.tax,
            totalAmount:orderDetails.total
        },
        coupon:couponData,
        orderStatus:paymentMethod==='razorpay'?'pending':"placed"
    })
    return data
}


const orderCartItmes = async(products,orderDetails,reqObj,userId,coupon=null,paymentMethod)=>{
   let items=[];

     
    if(reqObj.payment==='wallet'){
        
        const wallet = await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)});
        
        if(wallet.balance < orderDetails.total){
            throw new Error('"Your wallet balance is less than the order total. Please use another payment method ');
        }else{
            wallet.balance = wallet.balance-orderDetails.total;
            await wallet.save();

             let transactionId = helpers.generateTransactionId()
                await walletTransaction.create({
                    transactionId:transactionId,
                    userId:new mongoose.Types.ObjectId(userId),
                    amount:orderDetails.total,
                    type:"debit",
                    orderId:null
                })
        }
    }

   
    products.forEach(async (product)=>{
        items.push({
            productId:product.productId,
            variantId:product.variantId,
            productName:product.product.productName,
            quantity:product.quantity,
            finalPrice:product.finalPrice,
            price:parseInt(product.product.variants.price-((product.product.discound/100)*product.product.variants.price)),
            image:product.product.generalPhoto.url
        })

        await productModel.findOneAndUpdate(
            {_id:new mongoose.Types.ObjectId(product.productId)},
            {$inc:{'variants.$[variant].stock':-parseInt(product.quantity)}},
            {
                arrayFilters:[
                    {'variant._id':product.variantId}
                ]
            }

        )

        await wishlistModel.deleteOne({productId:product.productId,variantId:product.variantId})

    })
    let couponData
    if(coupon){
        couponData =  await couponModel.findOne({couponCode:coupon})
       couponData = {
        couponCode:couponData.couponCode,
        discount:couponData.discount,
        maximumDiscount:couponData.maximumDiscount,
        minimumOrder:couponData.minimumOrder
       }
        await couponUseCount.create({userId,couponCode:coupon})
    }
    else{
        couponData = null;
    }

    const orderId = helper.generateOrderId()

  const data =   await orderModel.create({
        userId:userId,
        orderId:orderId,
        items:items,
        payment:{
            method:reqObj.payment
        },
        address:{
            userName:reqObj.userName,
            companyName:reqObj.companyName,
            address:reqObj.address,
            pinCode:reqObj.pinCode,
            country:reqObj.country,
            state:reqObj.state,
            district:reqObj.city,
            email:reqObj.email,
            phoneNumber:reqObj.phoneNumber
        },
        pricing:{
            subTotal:orderDetails.totalPriceCartItem,
            discount:orderDetails.totalDiscountPrice,
            offerDiscount:orderDetails.offerDiscount,
            couponDiscount:orderDetails?.couponDiscount?orderDetails.couponDiscount:0,
            tax:orderDetails.tax,
            totalAmount:orderDetails.total
        },
        coupon:couponData
    
    })
 
    await cartModel.deleteMany({userId:userId})
    return data;

}

const checkOrderStock= async(productId,variantId)=>{
    console.log("this is wrking",productId,variantId)
   const product = await productModel.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId(productId)}},
        {$unwind:"$variants"},
        {$match:{"variants._id": new mongoose.Types.ObjectId(variantId)}}
    ])
        
     console.log("this is new prodduct",product)
        if(product.length===0 || Number(product[0]?.variants?.stock) < 1){
            return false;
        }

    return true;


}


const checkOrderStockForCart= async(products)=>{
    let flag = true
    let outOfStockProducts ='';
        for(let item of products){
        const product = await productModel.aggregate([
        {$match:{_id:item.productId}},
        {$unwind:"$variants"},
        {$match:{"variants._id":item.variantId}}
    ])
        
        if(product[0].variants.stock < 1){
            flag = false;
           outOfStockProducts += " "+product[0].productName;     
        }


    }
    console.log(flag)
    return {flag,outOfStockProducts}
}

const getSingleOrder = async(orderId)=>{
    
    return await orderModel.find({orderId:orderId});
}

const getSingleOrderById = async(orderId)=>{
    
    return await orderModel.find({_id:orderId});
}

const getOrders = async(userId,skip,limit)=>{
  return (await orderModel.find({userId:userId,isDeleted:false}).sort({"createdAt":-1}).skip(skip).limit(limit))
}
const countOrders = async(userId)=>{
    return await orderModel.countDocuments({userId});
}

const getAllOrders = async (skip,limit,sort,orderId,filter)=>{
    let pipeline = [];
     pipeline.push({$match:{$and:[
        {'orderStatus':{$ne:'pending'}},
        {'orderStatus':{$ne:'paymentFailed'}}
     ]}})
     if(orderId){
        pipeline.push({$match:{orderId:orderId}})
    }
    
    if(sort){
        switch(sort){
           case "ltoH":
            pipeline.push({$sort:{"pricing.totalAmout":-1}})
            break;
           case 'htoL':
            pipeline.push({$sort:{"pricing.totalAmount":1}})
            break;
           case "new":
            pipeline.push({$sort:{'createdAt':1}})
            break;
           case 'old':
            pipeline.push({$sort:{"createAt":-1}})
            break;

        }
    }
    else{
        pipeline.push({$sort:{"createdAt":-1}})
    }
    if(filter){
        switch(filter){
           case 'processing':
            pipeline.push({$match:{orderStatus:"placed"}})
            break; 
           case 'shipped':
            pipeline.push({$match:{orderStatus:"shipped"}})
            break;
           case 'delivered':
            pipeline.push({$match:{orderStatus:'delivered'}})
            break;
           case 'canceled':
            pipeline.push({$match:{orderStatus:'canceled'}})
            break;
        }
    }

   pipeline.push({$skip:skip},{$limit:limit})

    return await orderModel.aggregate(pipeline)
    // return await orderModel.find().sort({"createdAt":-1}).skip(skip).limit(limit)
}

const getAllOrdersCount = async() =>{
     return await orderModel.countDocuments();
}

const unlistOrder = async(orderId)=>{
    
    await orderModel.findOneAndUpdate({_id:orderId},{isDeleted:true});
}

const listOrder = async(orderId) =>{
    await orderModel.findOneAndUpdate({_id:orderId},{$set:{isDeleted:false}})
}

const updateData = async(orderId,orderStatus) =>{
    await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:orderStatus}})
}

const getOrderById = async(orderId,sort)=>{
    let pipeline = [];
    
    if(sort){
        switch(sort){
           case "ltoH":
            pipeline.puhs({$sort:{"totalAmout":-1}})
            break;
           case 'htoL':
            pipeline.puhs({$sort:{"totalAmount":1}})
            break;
           case "new":
            pipeline.push({$sort:{'createdAt':-1}})
            break;
           case 'old':
            pipeline.push({$sort:{"createAt":-1}})
            break;

        }
    }

    if(orderId){
        pipeline.push({$match:{orderId:orderId}})
    }
    return await orderModel.aggregate(pipeline)
}

const updateOrderCancel = async(orderId)=>{
   const items =  await orderModel.findOne({_id:orderId},{items:1,_id:0})
    items.items.forEach(async(item)=>{
        await productModel.findOneAndUpdate(
            {_id:item.productId},
            {$inc:{'variants.$[variant].stock':item.quantity}},
            {arrayFilters:[
                {'variant._id':item.variantId}
            ]}
        )
    })

   const order =  await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"canceled"}})
   if(order.payment.status === 'paid' && order.orderStatus != "canceled"){
      const amount = order.pricing.totalAmount
     await walletService.craditWallet(order.orderId,order.userId,amount);
   }
   return order

}

const searchByUser = async (userId,orderId)=>{
    return await orderModel.find({userId:userId,orderId:orderId})
}


const storeReturnOrderData = async(orderId,reason)=>{
    if(!await orderReturnModel.findOne({orderId:orderId,type:'all'})){
        await orderModel.findOneAndUpdate({orderId:orderId,type:"all"},{$set:{orderStatus:"return"}})
      return  await orderReturnModel.create({orderId,reason,type:"all"});
    }
    throw new Error("Canot request more than one time !")
    
}
const storeSingleReturnOrderData = async(orderId,reason,productId,variantId)=>{
     const productName = await productModel.find({_id:productId},{productName:1,_id:0})
     
      const isPresent = await orderReturnModel.findOne({orderId:new mongoose.Types.ObjectId(orderId),"product.variantId": new mongoose.Types.ObjectId(variantId)})
     if(isPresent)
     {
         throw new Error("Canot request more than one time !")
     }else{

         return await orderReturnModel.create({orderId:new mongoose.Types.ObjectId(orderId),reason,type:'single',product:{productName:productName[0].productName,productId:new mongoose.Types.ObjectId(productId),variantId:new mongoose.Types.ObjectId(variantId)}})
     }

}

const getAllReturnNotifications = async()=>{
   return await orderReturnModel.find({status:"pending"}).sort({createdAt:-1})
}

const deletereturnOrder = async(orderId,type)=>{
    
       await orderReturnModel.findOneAndUpdate({orderId:orderId,type},{$set:{status:"rejected"}})

 ;
}

const acceptOrderReturn = async(orderId,userId) =>{
     console.log("accepted succussfuly",orderId)
    const returnOrder = await orderReturnModel.findOneAndUpdate({orderId:orderId},{$set:{status:"accept"}})
    const order =    await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"return"}})


          if(order.payment.method === 'razorpay' || order.payment.method === 'wallet'){
         await walletModel.findOneAndUpdate({userId:userId},{$inc:{balance:order.pricing.totalAmount}})
         let transactionId = helpers.generateTransactionId()
                await walletTransaction.create({
                    transactionId:transactionId,
                    userId:new mongoose.Types.ObjectId(userId),
                    amount:order.pricing.totalAmount,
                    reason:'refund',
                    type:"cradit",
                    orderId:order.orderId
                })
    

    }
   

}




const getOrderDataForDashbord = async(userId)=>{
  const pending =  await orderModel.countDocuments({userId,$or:[{orderStatus:{$eq:'placed'}},{orderStatus:{$eq:"shippend"}}]});
  const totalOrder = await orderModel.countDocuments({userId});
  const completed = await orderModel.countDocuments({userId,orderStatus:"delivered"});
  return {pending,totalOrder,completed}
}

const cancelSingleProduct = async(orderId,productId,variantId,quantity,userId) =>{
   await orderModel.findOneAndUpdate({_id:orderId},
        {
            $set:{'items.$[product].status':"cancelled"}
        },
        {
            arrayFilters:[
                {'product.variantId':variantId}
            ]
        }
    )

   await productModel.findOneAndUpdate(
            {_id:productId},
            {$inc:{'variants.$[variant].stock':quantity}},
            {arrayFilters:[
                {'variant._id':variantId}
            ]}
        )
    let order = await orderModel.findOne({_id:orderId});
        console.log("this is order ",order)
        let subTotal = 0;
        for( let item of order.items){
            if(item.status === "placed"){
                 subTotal += item.price;   
            }
        }
        let tax = (subTotal * 18) / 100;
        let totalAmount = subTotal+tax;
         

     order =  await orderModel.findOneAndUpdate({_id:orderId},{$set:{
            'pricing.subTotal':subTotal,
             'pricing.tax':tax,
             "pricing.totalAmount":totalAmount
        }})

        const orderData =  await orderModel.aggregate([
            {$match:{_id: new mongoose.Types.ObjectId(orderId)}},
            {$unwind:'$items'},
            {$match:{'items.variantId':new mongoose.Types.ObjectId(variantId)}}
        ]);

 
            
            if(orderData[0].payment.method === 'razorpay' || orderData[0].payment.method === 'wallet' ){
                   
            const wallet = await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)});
        
    
            wallet.balance = wallet.balance+Number(orderData[0].items.finalPrice.toFixed(2)); 
            await wallet.save();

             let transactionId = helpers.generateTransactionId()
                 await walletTransaction.create({
                    transactionId:transactionId,
                    userId:new mongoose.Types.ObjectId(userId),
                    amount:Number(orderData[0].items.finalPrice.toFixed(2)),
                    type:"cradit",
                    orderId:orderData[0].orderId
                })

                }
       


        return order
}


const rejectSingleReturnProduct= async(orderId,variantId,productId)=>{

    // await orderModel.findOneAndUpdate({_id:orderId},
    //     {$set:{
    //         'items.$[item].status':
    //     }}
    // )

   const data =  await orderReturnModel.findOneAndUpdate({orderId:orderId,type:"single",'product.variantId':new mongoose.Types.ObjectId(variantId)},{$set:{status:"rejected"}})
}

const aproveSingleReturnProduct = async(orderId,variantId,productId) =>{
    const returnOrder =  await orderReturnModel.findOneAndUpdate({orderId:orderId,type:"single",'product.variantId':new mongoose.Types.ObjectId(variantId)},{$set:{status:"approved"}})
    console.log(data);
   const order =   await orderModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(orderId)},{
        $set:{'items.$[item].status':"return"}
    },
    {arrayFilters:[
        {'item.variantId':new mongoose.Types.ObjectId(variantId)}
    ]}

)

         if(returnOrder?.product){
         order = await order.aggregate([
                {$match:{_id:order._id}},
                {$unwind:'$items'},
                {
                    $match:{'items.variantId':returnOrder.product.variantId}
                }
            ])

            if(order.payment.method === 'razorpay' || order.payment.method === 'wallet'){
         await walletModel.findOneAndUpdate({userId:userId},{$inc:{balance:Number(order.items.finalPrice)}})
         let transactionId = helpers.generateTransactionId()
                await walletTransaction.create({
                    transactionId:transactionId,
                    userId:new mongoose.Types.ObjectId(userId),
                    amount:order.items.finalPrice,
                    reason:'refund',
                    type:"cradit",
                    orderId:order.orderId
                })
    }

    }

 
}


const getOrdersForSalesReport= async(startDate,endDate)=>{
    if(startDate){
          return await orderModel.aggregate([
        {$match:{orderStatus:'delivered',createdAt:{$gte:startDate,$lte:endDate}}},
        {$lookup:{
            from:'users',
            localField:"userId",
            foreignField:"_id",
            as:"user"
        }},
        {$project:{
            createdAt:1,
            orderId:1,
            'user.userName':1,
            pricing:1
        }}
    ])
    }
    return  await orderModel.aggregate([
        {$match:{orderStatus:'delivered'}},
        {$lookup:{
            from:'users',
            localField:"userId",
            foreignField:"_id",
            as:"user"
        }},
        {$project:{
            createdAt:1,
            orderId:1,
            'user.userName':1,
            pricing:1
        }}
    ])
  
}

export default {
    orderSingleProduct,
    orderCartItmes,
    getOrders,
    countOrders,
    getSingleOrder,
    getSingleOrderById,
    getAllOrders,
    getAllOrdersCount,
    unlistOrder,
    listOrder,
    updateData,
    getOrderById,
    updateOrderCancel,
    searchByUser,
    storeReturnOrderData,
    getAllReturnNotifications,
    deletereturnOrder,
    acceptOrderReturn,
    checkOrderStock,
    checkOrderStockForCart,
    getOrderDataForDashbord,
    cancelSingleProduct,
    storeSingleReturnOrderData,
    rejectSingleReturnProduct,
    aproveSingleReturnProduct,
    getOrdersForSalesReport
   
}