import wishlistModel from '../Models/wishlistSchema.js'
import mongoose from 'mongoose'

const storeWishlistItemInDB= async (productId,variantId,userId) =>{
 const data =  await  wishlistModel.create({
        productId:productId,
        variantId:variantId,
        userId:userId
    })
}

const getWishlistItems = async(userId) =>{
   const data =  await wishlistModel.aggregate([
    {$match:{userId:new mongoose.Types.ObjectId(userId)}},
    {
        $lookup:{
            from:"products",
            let:{variantId:"$variantId"},
            pipeline:[
                {$unwind:"$variants"},
                {$match:{
                    $expr:{
                        $eq:["$variants._id","$$variantId"]
                    }
                }},
                {$project:{
                    productName:1,
                    generalPhoto:1,
                    discound:1,
                    variants:1
                }}
            ],
            as:"product",
        }
    },
    {$unwind:"$product"}
   ])
   if(data.length > 0){
    return data
   }
   else{
    return false;
   }
}


const remove = async(id)=>{
   await wishlistModel.deleteOne({_id:id});
}

export default {
    storeWishlistItemInDB,
    getWishlistItems,
    remove
}