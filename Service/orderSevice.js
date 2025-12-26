import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'
import {productModel} from '../Models/productSchema.js'
import helper from '../helpers/helpers.js'
import cartModel from '../Models/cartSchema.js'


const orderSingleProduct = async(productId,variantId,quantity,userId,productName,generalPhoto,paymentMethod,reqObj,orderDetails,price,discount)=>{

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
    await orderModel.create({
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



    })

    const orderId = helper.generateOrderId()

    await orderModel.create({
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
            subTotal:orderDetails.otalPriceCartItem,
            discount:orderDetails.totalDiscountPrice,
            tax:orderDetails.tax,
            totalAmount:orderDetails.total
        },
    
    })
 
    await cartModel.deleteMany({userId:userId})

}


const getSingleOrder = async(orderId)=>{
    
    return await orderModel.find({_id:orderId});
}

const getOrders = async(userId,skip,limit)=>{
  return (await orderModel.find({userId:userId}).sort({"createdAt":-1}).skip(skip).limit(limit))
}
const countOrders = async(userId)=>{
    return await orderModel.countDocuments({userId});
}

export default {
    orderSingleProduct,
    orderCartItmes,
    getOrders,
    countOrders,
    getSingleOrder
}