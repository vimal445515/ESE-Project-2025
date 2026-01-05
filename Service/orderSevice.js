import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'
import {productModel} from '../Models/productSchema.js'
import helper from '../helpers/helpers.js'
import cartModel from '../Models/cartSchema.js'
import addressModel from '../Models/addressSchema.js'
import orderReturnModel from "../Models/orderReturnSchema.js"
import wishlistModel from '../Models/wishlistSchema.js'



const orderSingleProduct = async(productId,variantId,quantity,userId,productName,generalPhoto,paymentMethod,reqObj,orderDetails,price,discount)=>{


    
    //store address
    await addressModel.create()

    // Reduce stock
    await productModel.findOneAndUpdate(
        {_id: new mongoose.Types.ObjectId(productId)},
        {$inc:{'variants.$[variant].stock':-quantity}},
        {arrayFilters:[
            {'variant._id':variantId}
        ]}
    )

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
                productName:productName,
                price:parseInt(price-((discount/100)*price)),
                image:generalPhoto,
                
            }
        ],
        payment:{
            method:paymentMethod
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
            subTotal:orderDetails.otalPriceCartItem,
            discount:orderDetails.totalDiscountPrice,
            tax:orderDetails.tax,
            totalAmount:orderDetails.total
        },
    
    })
    return data
}


const orderCartItmes = async(products,orderDetails,reqObj,userId)=>{
   let items=[];

   
    products.forEach(async (product)=>{
        items.push({
            productId:product.productId,
            variantId:product.variantId,
            productName:product.product.productName,
            quantity:product.quantity,
            price:parseInt(product.product.variants.price-((product.product.discound/100)*product.product.variants.price)),
            image:product.product.generalPhoto
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
            tax:orderDetails.tax,
            totalAmount:orderDetails.total
        },
    
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
        if(product.length===0 || product[0]?.variants?.stock < 1){
            return false;
        }

    return true;


}


const checkOrderStockForCart= async(products)=>{
    let flag = true
        for(let item of products){
        const product = await productModel.aggregate([
        {$match:{_id:item.productId}},
        {$unwind:"$variants"},
        {$match:{"variants._id":item.variantId}}
    ])
        
        if(product[0].variants.stock < 1){
            console.log("this  is wrking")
            return  false
             
        }


    }
    console.log(flag)
    return flag;
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
   console.log("this is items",items[0])
    items.items.forEach(async(item)=>{
        await productModel.findOneAndUpdate(
            {_id:item.productId},
            {$inc:{'variants.$[variant].stock':item.quantity}},
            {arrayFilters:[
                {'variant._id':item.variantId}
            ]}
        )
    })

    return await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"canceled"}})
}

const searchByUser = async (userId,orderId)=>{
    return await orderModel.find({userId:userId,orderId:orderId})
}


const storeReturnOrderData = async(orderId,reason)=>{
    if(!await orderReturnModel.findOne({orderId:orderId})){
      return  await orderReturnModel.create({orderId,reason});
    }
    throw new Error("Canot request more than one time !")
    
}

const getAllReturnNotifications = async()=>{
   return await orderReturnModel.find({status:"pending"})
}

const deletereturnOrder = async(orderId)=>{
    
       await orderReturnModel.findOneAndUpdate({orderId:orderId},{$set:{status:"rejected"}})

 ;
}

const acceptOrderReturn = async(orderId) =>{
     console.log("accepted succussfuly",orderId)
     await orderReturnModel.findOneAndUpdate({orderId:orderId},{$set:{status:"accept"}})
     await orderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"return"}})

}

const getOrderDataForDashbord = async(userId)=>{
  const pending =  await orderModel.countDocuments({userId,$or:[{orderStatus:{$eq:'placed'}},{orderStatus:{$eq:"shippend"}}]});
  const totalOrder = await orderModel.countDocuments({userId});
  const completed = await orderModel.countDocuments({userId,orderStatus:"delivered"});
  return {pending,totalOrder,completed}
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
    getOrderDataForDashbord
   
}