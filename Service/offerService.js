import offerModel from "../Models/offerSchema.js";
import mongoose from 'mongoose'
import productService from "./productService.js";

const createOffer = async(offerName,productId,discount,expiryDate)=>{
   const productName =  await productService. getSingleProductName(productId)
    await offerModel.create({
        offerName,
        itemName:productName,
        offerType:'product',
        targetId:new mongoose.Types.ObjectId(productId),
        discount,
        expiryDate
    })
}

const getAllOffers = async(offerType,skip,limit)=>{
    return await offerModel.aggregate(
        [
            {$match:{offerType:offerType}},
            {$skip:skip},
            {$limit:limit}
        ]
    )
}
const getCout = async(offerType)=>{
    return await offerModel.countDocuments({offerType});
}

const enableOffer=async(offerType,offerId,targetId)=>{
    
    await offerModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(offerId)},{$set:{isActive:true}})
    await offerModel.updateMany({offerType,_id:{$ne:new mongoose.Types.ObjectId(offerId)},targetId:new mongoose.Types.ObjectId(targetId)},{$set:{isActive:false}})
}
const desebleOffer = async(offerId)=>{
 await offerModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(offerId)},{$set:{isActive:false}})
  
}

const updateOffer = async(offerName,discount,expiryDate,offerId)=>{
    await offerModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(offerId)},{$set:{offerName,discount,expiryDate}})
}
export default { 
    createOffer,
    getAllOffers,
    getCout,
    enableOffer,
    desebleOffer,
    updateOffer 
}