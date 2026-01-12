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

const getCoupons = async() =>{
    return couponModel.find().sort({createdAt:-1});
}

export default {
    storeCouponInDB,
    getCoupons
}