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
    pipeline.push({$sort:{createdAt:-1}})
    if(filter){
        if(filter === 'active'){
            pipeline.push({$match:{isActive:true}})
        }
        else if(filter !== 'all'){
             pipeline.push({$match:{isActive:false}})
        }
    }
    if(search){
        pipeline.push({$match:{couponCode:search}});
    }
    pipeline.push({$skip:skip},{$limit:limit});
    return await couponModel.aggregate(pipeline);
}

const getCount = async(filter)=>{
    if(filter === 'expired'){
         return await couponModel.countDocuments({isActive:false});
    }
    else if(filter === 'active'){
        return await couponModel.countDocuments({isActive:true});
    }
    else{
        return  await couponModel.countDocuments();
    }
 
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
    // const  discount = (oldAmount.totalPriceCartItem*(coupon.discount/100))
    const orderTotalBeforeCoupon = products.reduce((sum, item) => {
        return sum + (item.finalPrice * item.quantity);
    }, 0);

    let discount = (orderTotalBeforeCoupon * coupon.discount) / 100;

   const  couponDiscount = Math.min(discount,coupon.maximumDiscount)

    


   
   const totalPriceCartItem = Number(oldAmount.totalPriceCartItem) ; // Applay discount
   
  // Calculate total discount price 
    const totalDiscountPrice = Number(oldAmount.totalDiscountPrice) + couponDiscount;


     products = products.map((item)=>{
        console.log("this is :",item.offerDiscountAmount)
    //    let itemCouponDiscountAmount = (item.finalPrice/oldAmount.total) * couponDiscount
            let itemTotal = item.finalPrice * item.quantity;

            let ratio = itemTotal / orderTotalBeforeCoupon;

            let itemCouponDiscountAmount =
                Number((ratio * couponDiscount).toFixed(2));

            let couponAppliedFinalPrice =
                Number((itemTotal - itemCouponDiscountAmount).toFixed(2));
        return {
            ...item,
             couponAppliedFinalPrice:couponAppliedFinalPrice ,                    //(item.finalPrice*item.quantity)-itemCouponDiscountAmount,
            itemCouponDiscountAmount:itemCouponDiscountAmount,
            offerDiscountAmount:item.offerDiscountAmount
           
        }
       
    })

    console.log("this is products",products)


  const  tax = ( (Number(totalPriceCartItem) - Number(totalDiscountPrice)) * 18 ) / 100
  
  
  const total =  (totalPriceCartItem- totalDiscountPrice) + tax

 return {totalPriceCartItem:Number(totalPriceCartItem),totalDiscountPrice:Number(totalDiscountPrice),tax:Number(tax),total:Number(total),couponDiscount:Number(couponDiscount),products:products,offerDiscount:Number(oldAmount.totalDiscountPrice)}
}






const calculateTotalAmount = (products)=>{
    return cartService.cartSummary(products)
}

const getCouponsForCheckout = async(orderDetails,userId)=>{
       let coupons = await couponModel.find({expiryDate:{$gte:new Date()},isActive:true})
       const couponResult = []

       for(let coupon of coupons)
       {
         if(!await couponUseCount.findOne({couponCode:coupon.couponCode,userId:userId})){
            couponResult.push(coupon)
         }
       }

       return couponResult


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