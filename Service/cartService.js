import cartModel from '../Models/cartSchema.js'
import mongoose from 'mongoose'
import {productModel} from '../Models/productSchema.js'
import wishlistModel from '../Models/wishlistSchema.js'
const addProduct = async(productId,variantId,userId,quantity) =>{
    try{
        await cartModel.create({
        productId:productId,
        variantId:variantId,
        userId:userId,
        quantity:quantity
     })
      await wishlistModel.deleteOne({productId:productId,variantId:variantId})
    }catch(error){
        throw new Error("Somthing wrong to store cart items!");
    }
}

const getCartItems = async (id) =>{

  let pipeline = [];
  pipeline.push(
    
  {
    $match: {
      userId: new mongoose.Types.ObjectId(id)
    }
  },
  {
    $lookup: {
      from: "products",
      let: { variantId: "$variantId" },
      pipeline: [
        { $unwind: "$variants" },
        {
          $match: {
            $expr: {
              $eq: ["$variants._id", "$$variantId"]
            }
          }
        },
        {
          $project: {
            productName: 1,
            basePrice: 1,
            discound:1,
            categoryId:1,
            isDeleted:1,
            generalPhoto: 1,
            variants: 1
          }
        }
      ],
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $lookup:{
      from:"categories",
      localField:"product.categoryId",
      foreignField:"_id",
      as:"category"
    }
  },
  {$unwind:"$category"}
  )

   // calculate offer 

  // get product offer
   pipeline.push(
    {$lookup:{
      from:'offers',
      let:{'productId':'$product._id'},
      pipeline:[
       {
         $match:{
          $expr:{
            $and:[
              {$eq:['$targetId','$$productId']},
              {$eq:['$isActive',true]},
              {$gte:['$expiryDate',new Date()]} 
            ]
          }
        }
       }
      ]

      ,as:"productOffer"
    }
  
  }
  )

 // get category offer
  pipeline.push({
    $lookup:{
      from:"offers",
      let:{'categoryId':'$product.categoryId'},
      pipeline:[
        {$match:{
         $expr:{
          $and:[
            {$eq:['$targetId','$$categoryId']},
            {$eq:['$isActive',true]},
            {$gte:['$expiryDate',new Date()]}
          ]
         }
        }}
      ],
      as:"categoryOffer"
    }
  })


  pipeline.push({
    $addFields:{
      productDiscount:{
        $ifNull:[{$arrayElemAt:['$productOffer.discount',0]},0]
      },
      categoryDiscount:{
        $ifNull:[{$arrayElemAt:['$categoryOffer.discount',0]},0]
      }
    }
  })

  // get final discount

  pipeline.push(
    {$addFields:{
     finalDiscount:{$max:[
        '$product.discound',
        '$productDiscount',
        '$categoryDiscount'
      ]}
    }},
    {$addFields:{
      finalPrice:{
        $subtract:[
          "$product.variants.price",{$multiply:['$product.variants.price',{$divide:['$finalDiscount',100]}]}
        ]
      }
    }}
  )



   
 let data = await cartModel.aggregate(pipeline);
return data;

    
}

const deleteCartItemFromDB = async(_id)=>{
  try{
    await cartModel.deleteOne({_id:_id});
  }catch(error){
    throw new error("!oops somthing was wrong");
  }
}


const checkcartItem = async(productId,variantId)=>{
 const isTrue =  await cartModel.find({productId:productId,variantId:variantId})
 if(isTrue.length !=0){
  return true
 }else{
  return false
 }
}

const decrementQuantity = async(productId,variantId) =>{
  try{
    await cartModel.findOneAndUpdate({productId:productId,variantId:variantId},{$inc:{quantity:-1}})
  }
  catch(error){

    throw new Error("!oops somthing was wrong")

  }
  
}

const incrementQuantity = async(productId,variantId,quantity) =>{
  try{
    await cartModel.findOneAndUpdate({productId:productId,variantId:variantId},{$inc:{quantity:quantity}})
  }
  catch(error){

    throw new Error("!oops somthing was wrong")

  }
  
}

const cartSummary = (items)=>{
  // Calculating total price of every itme in the items and store into a array with discount
    const totalPriceCartItem = items.reduce((total,item)=>{
      total += (parseInt(item.product.variants?.price*item.quantity))
      return total;
    },0)

    console.log("total",totalPriceCartItem,items)

     
  // Calculate total discount price 
   const totalDiscountPrice = items.reduce((total,item)=>{
      total += (parseInt(item.finalPrice*item.quantity))
      return total;
    },0)

    

  const  tax =parseInt (( (totalPriceCartItem-totalDiscountPrice)* 18 ) / 100)
  const total =  (totalPriceCartItem-totalDiscountPrice) + tax

   return {totalPriceCartItem,totalDiscountPrice,tax,total}
  
}



const cartItemsBlocked = async (userId)=>{
const cartItems = await getCartItems(userId);
 let flag = false;
 let message = ""
 cartItems.forEach((item)=>{
  if(item.product.isDeleted || item.category.isBlocked){
    message += " "+item.product.productName;
    flag = true;
  }
 })

 return {flag,message}
}


const getCartSingleItem = async(productId,variantId)=>{
  
 return await productModel.aggregate([
    {$match:{_id:new mongoose.Types.ObjectId(productId)}},
    {$unwind:"$variants"},
    {$match:{"variants._id":new mongoose.Types.ObjectId(variantId)}}
    
  ])
}

const getCartQuantity = async(productId,variantId)=>{
  return await cartModel.findOne({productId,variantId},{_id:0,quantity:1});
}




export default {
    addProduct,
    getCartItems,
    deleteCartItemFromDB,
    checkcartItem,
    decrementQuantity,
    incrementQuantity,
    cartSummary,
    cartItemsBlocked,
    getCartSingleItem,
    getCartQuantity
   
}
