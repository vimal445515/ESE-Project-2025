import {productModel} from '../Models/productSchema.js'
import mongoose from 'mongoose'

const getProduct = async(productId,variantId)=>{
    console.log(productId,variantId)
  const data =await  productModel.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId(productId)}},
        {$unwind:'$variants'},
        {$match:{"variants._id":new mongoose.Types.ObjectId(variantId)}}
        
    ])
    console.log(data)
   return data;
}

export default {
    getProduct
}