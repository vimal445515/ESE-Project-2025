import cartModel from '../Models/cartSchema.js'
import mongoose from 'mongoose'
const addProduct = async(productId,variantId,userId,quantity) =>{
    try{
        await cartModel.create({
        productId:productId,
        variantId:variantId,
        userId:userId,
        quantity:quantity
     })
    }catch(error){
        throw new Error("Somthing wrong to store cart items!");
    }
}

const getCartItems = async (id) =>{
   
 let data = await cartModel.aggregate([
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
            generalPhoto: 1,
            variants: 1
          }
        }
      ],
      as: "product"
    }
  },
  { $unwind: "$product" }
]);

   
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

const incrementQuantity = async(productId,variantId) =>{
  try{
    await cartModel.findOneAndUpdate({productId:productId,variantId:variantId},{$inc:{quantity:1}})
  }
  catch(error){

    throw new Error("!oops somthing was wrong")

  }
  
}


const cartSummary = (items)=>{
  
  // Calculating total price of every itme in the items and store into a array with discount
    const totalPriceCartItem = items.reduce((total,item)=>{
      total += ((item.product.variants.price*item.quantity)-parseInt((item.product.discound/100)*(item.product.variants.price*item.quantity)))
      return total;
    },0)
  // Calculate total discount price 
   const totalDiscountPrice = items.reduce((total,item)=>{
      total += (parseInt((item.product.discound/100)*(item.product.variants.price*item.quantity)))
      return total;
    },0)

  const  tax =parseInt( ( totalPriceCartItem* 18 ) / 100)
  const total =  totalPriceCartItem+ tax

   return {totalPriceCartItem,totalDiscountPrice,tax,total}
  
}

export default {
    addProduct,
    getCartItems,
    deleteCartItemFromDB,
    checkcartItem,
    decrementQuantity,
    incrementQuantity,
    cartSummary
}
