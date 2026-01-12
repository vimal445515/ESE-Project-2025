import mongoose from 'mongoose'
import { couponModel } from '../Models/couponSchema.js'
import helpers from '../helpers/helpers.js'

const storeCouponInDB = async(discount,minimumOrder,maximumDiscount,expiryDate)=>{
   const  couponCode =  helpers.generateCouponCode()
   const coupon = new couponModel({
        couponCode,
        discount,
        minimumOrder,
        maximumDiscount,
        expiryDate:new Date(expiryDate)
    })

    await coupon.save()

}

const getCoupons = async(page,limit,search,filter) =>{
    const skip = helpers.paginationSkip(page,limit)
    const pipeline = []
    if(filter){
        if(filter === 'active'){
            pipeline.push({$match:{isActive:true}})
        }
        else{
             pipeline.push({$match:{isActive:false}})
        }
    }
    if(search){
        pipeline.push({$match:{couponCode:search}});
    }
    pipeline.push({$skip:skip},{$limit:limit});
    return await couponModel.aggregate(pipeline);
}

const getCount = async()=>{
  return await couponModel.countDocuments();
}

const activate = async(couponId)=>{
    await couponModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(couponId)},{$set:{isActive:true}})
}

const deactive =  async(couponId)=>{
    await couponModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(couponId)},{$set:{isActive:false}})
}


const updateCoupon = async(couponCode,discount,minimumOrder, maximumDiscount,expiryDate)=>{
    await couponModel.findOneAndUpdate({couponCode},{$set:{
        discount,
        minimumOrder,
        maximumDiscount,
        expiryDate
    }})
}



export default {
    storeCouponInDB,
    getCoupons,
    getCount,
    activate,
    deactive,
    updateCoupon
}