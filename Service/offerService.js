import offerModel from "../Models/offerSchema.js";
import mongoose from 'mongoose'
import productService from "./productService.js";
import categoryService from "./categoryService.js";

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
            {$limit:limit},
            {$sort:{'createdAt':-1}}
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

const createCategoryOffer = async(offerName,categoryId,discount,expiryDate)=>{
    const category = await categoryService.getSingleCategoryName(categoryId)
    await offerModel.create(
       {
        offerName,
        targetId:new mongoose.Types.ObjectId(categoryId),
        offerType:"category",
        itemName:category.categoryName,
        discount,
        expiryDate
       }
    )
}


const calculateOffersForProducts = async(products)=>{
   
    const result = await Promise.all(products.map(async(product)=>{
        const categoryDiscount = await offerModel.findOne({isActive:true,expiryDate:{$gte:new Date()},offerType:"category",targetId:new mongoose.Types.ObjectId(product.categoryId)});
        const productDiscount = await offerModel.findOne({isActive:true,expiryDate:{$gte:new Date()},offerType:"product",targetId:new mongoose.Types.ObjectId(product._id)});
        let offer;
        if(!categoryDiscount && !productDiscount)
        {
            offer = null;
        }
        else if(categoryDiscount && !productDiscount){
            offer = categoryDiscount;
        }
        else if(!categoryDiscount && productDiscount){
            offer = productDiscount;
        }
        else if(categoryDiscount && productDiscount){
            offer = productDiscount.discount >= categoryDiscount.discount?productDiscount:categoryDiscount
        }
        if(offer){
           if(offer.discount>product.discount){
              product.discount = offer.discount;  
           } 
        }
        return product
    }))
     console.log(result)
    return result;

}
export default { 
    createOffer,
    getAllOffers,
    getCout,
    enableOffer,
    desebleOffer,
    updateOffer ,
    createCategoryOffer,
    calculateOffersForProducts
}