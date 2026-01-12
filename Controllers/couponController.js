import couponService from "../Service/couponService.js";


const loadCouponPage= async(req,res)=>{
    const coupons = await couponService.getCoupons();
    res.render('Admin/couponPage',{userName:null,profile:null,coupons})
}

const createCoupon = async(req,res)=>{
    const {discount,minimumOrder,maximumDiscount,expiryDate} = req.body;
    await couponService.storeCouponInDB(discount,minimumOrder,maximumDiscount,expiryDate)
    return  res.redirect('/coupon');
}

export default {
    loadCouponPage,
    createCoupon
}
