import couponService from "../Service/couponService.js";


const loadCouponPage= async(req,res)=>{
    const page = req.query.page||1
    const search = req.query.search||null
    const filter = req.query.filter||null
    const limit = 9;
    const coupons = await couponService.getCoupons(page,limit,search,filter);
    const count = await couponService.getCount()
    res.render('Admin/couponPage',{userName:null,profile:null,coupons,page,count,limit})
}

const createCoupon = async(req,res)=>{
    const {discount,minimumOrder,maximumDiscount,expiryDate} = req.body;
    await couponService.storeCouponInDB(discount,minimumOrder,maximumDiscount,expiryDate)
    return  res.redirect('/coupon');
}
const activateCoupon = async(req,res)=>{
    const couponId = req.body.couponId;
    console.log(couponId)
    await couponService.activate(couponId)
    return res.status(200).json({type:"success"});

}

const deactiveCoupon = async(req,res)=>{
     const couponId = req.body.couponId;
    await couponService.deactive(couponId)
    return res.status(200).json({type:"success"});
}

const editCoupon = async(req,res)=>{
    const {couponCode,discount,minimumOrder, maximumDiscount,expiryDate} = req.body
    await couponService.updateCoupon(couponCode,discount,minimumOrder, maximumDiscount,expiryDate)
    res.redirect('/coupon');
}
export default {
    loadCouponPage,
    createCoupon,
    activateCoupon,
    deactiveCoupon,
    editCoupon
}
