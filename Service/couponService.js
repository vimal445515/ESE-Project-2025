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

const getCoupons = async(page,limit) =>{
    const skip = helpers.paginationSkip(page,limit)
    const pipeline = []
    pipeline.push({$skip:skip},{$limit:limit});
    return await couponModel.aggregate(pipeline);
}

const getCount = async()=>{
  return await couponModel.countDocuments();
}



export default {
    storeCouponInDB,
    getCoupons,
    getCount
}