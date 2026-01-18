import mongoose from 'mongoose'
import { couponModel,couponUseCount } from '../Models/couponSchema.js'
import helpers from '../helpers/helpers.js'
import cartService from './cartService.js'

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


const applayCouponCodeInTotalAmount = async(products,couponCode,userId)=>{
    console.log(couponCode,userId)
    const coupon = await couponModel.findOne({couponCode:couponCode})
    
    if(!coupon){
       throw new Error("Coupon is not valid");
    }
    if(!coupon.isActive){
        throw new Error("Coupon is not Active now")
    }

    if(coupon.expiryDate<new Date()){
        throw new Error("Coupon is expired")
    }
    
    const oldAmount = cartService.cartSummary(products)
    if(oldAmount.total<coupon.minimumOrder){
        throw new Error(`This coupon require a minimum amount of ${coupon.minimumOrder} INR`)
    }
    if(await couponUseCount.findOne({couponCode:coupon.couponCode,userId:userId})){
        throw new Error('This coupon is already used');
    }
    const  discount = (oldAmount.totalPriceCartItem*(coupon.discount/100))
   const  couponDiscount = Math.min(discount,coupon.maximumDiscount)

    // Calculating total price of every itme in the items and store into a array with discount
    // let totalPriceCartItem = products.reduce((total,item)=>{
    //   total += ((item.product.variants?.price*item.quantity)-parseInt((item.product.discound/100)*(item.product.variants?.price*item.quantity)))
    //   return total;
    // },0)



   const totalPriceCartItem = oldAmount.totalPriceCartItem ; // Applay discount
  // Calculate total discount price 
    const totalDiscountPrice = oldAmount.totalDiscountPrice + couponDiscount;

//    const totalDiscountPrice = products.reduce((total,item)=>{
//       total += (parseInt((item.product.discound/100)*(item.product.variants?.price*item.quantity)))
//       return total;
//     },0)

  const  tax =parseInt( ( (totalPriceCartItem - totalDiscountPrice) * 18 ) / 100)
  const total =  (totalPriceCartItem- totalDiscountPrice) + tax

 return {totalPriceCartItem,totalDiscountPrice,tax,total,couponDiscount}
}

const calculateTotalAmount = (products)=>{
    return cartService.cartSummary(products)
}

const getCouponsForCheckout = async(orderDetails)=>{
       let coupons = await couponModel.find({expiryDate:{$gte:new Date()},isActive:true})
      

       return coupons


}



export default {
    storeCouponInDB,
    getCoupons,
    getCount,
    activate,
    deactive,
    updateCoupon,
     applayCouponCodeInTotalAmount,
     calculateTotalAmount,
     getCouponsForCheckout
}