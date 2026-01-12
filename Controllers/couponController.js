import couponService from "../Service/couponService.js";


const loadCouponPage= async(req,res)=>{
    const page = req.query.page||1
    const limit = 10;
    const coupons = await couponService.getCoupons(page,limit);
    const count = await couponService.getCount()
    res.render('Admin/couponPage',{userName:null,profile:null,coupons,page,count,limit})
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
