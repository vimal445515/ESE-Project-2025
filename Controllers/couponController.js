import couponService from "../Service/couponService.js";
import cartService from "../Service/cartService.js";
import checkoutService from "../Service/checkoutService.js";
const loadCouponPage= async(req,res)=>{
    try{
    const page = req.query.page||1
    const search = req.query.search||null
    const filter = req.query.filter||null
    const limit = 9;
    const coupons = await couponService.getCoupons(page,limit,search,filter);
    const count = await couponService.getCount()
    res.render('Admin/couponPage',{userName:null,profile:null,coupons,page,count,limit})
    }catch(error){
        console.log(error)
        res.status(500).redirect('/500Error')
    }
}

const createCoupon = async(req,res)=>{
    try{
    const {discount,minimumOrder,maximumDiscount,expiryDate} = req.body;
    await couponService.storeCouponInDB(discount,minimumOrder,maximumDiscount,expiryDate)
    return  res.redirect('/coupon');
    }catch(error){
        console.log(error)
        res.status(500).redirect('500Error');
    }
}
const activateCoupon = async(req,res)=>{
    try{
    const couponId = req.body.couponId;
    await couponService.activate(couponId)
    return res.status(200).json({type:"success"});
    }catch(error){
        console.log(error)
        return res.status(500).json({type:'error',message:'Internal server error'})
    }

}

const deactiveCoupon = async(req,res)=>{
    try{
     const couponId = req.body.couponId;
    await couponService.deactive(couponId)
    return res.status(200).json({type:"success"});
    }catch(error){
        console.log(error)
        return res.status(500).json({type:'error',message:'Internal server error'})
    }
}

const editCoupon = async(req,res)=>{
    try{
    const {couponCode,discount,minimumOrder, maximumDiscount,expiryDate} = req.body
    await couponService.updateCoupon(couponCode,discount,minimumOrder, maximumDiscount,expiryDate)
    res.redirect('/coupon');
    }catch(error){
        console.log(error);
        res.status(500).redirect('/500Error')
    }
}


const applayCoupon = async(req,res)=>{
    let products;
try{
    if(req.body?.productId){
        products = await checkoutService.getProduct(req.body.productId,req.body.variantId)
        products[0].quantity = Number(req.body.quantity);
    }else{
         products =  await cartService.getCartItems(req.session._id)
    }
    const couponCode = req.body.couponCode;
   try{
    const {totalPriceCartItem,totalDiscountPrice,tax,total,couponDiscount,offerDiscount} =  await couponService.applayCouponCodeInTotalAmount(products,couponCode,req.session._id)
    console.log(totalPriceCartItem," ",totalDiscountPrice," ",tax," ",total," ",couponDiscount)
    res.status(200).json({type:"success",totalPriceCartItem,totalDiscountPrice,tax,total,couponDiscount,couponCode,offerDiscount})
   }
   catch(error){
    res.status(400).json({type:"error",message:error.message});
   }
   }catch(error){
    console.log(error)
    res.status(500).json({type:'error',message:'Internal server error'})
   }

}

const removeCoupon = async(req,res)=>{
   let products
   try{
   
     if(req.body?.productId){
        products = await checkoutService.getProduct(req.body.productId,req.body.variantId)
        products[0].quantity = Number(req.body.quantity);
    }else{
         products =  await cartService.getCartItems(req.session._id)
    }
    const {totalPriceCartItem,totalDiscountPrice,tax,total} = couponService.calculateTotalAmount(products)
    
    return res.status(200).json({totalPriceCartItem,totalDiscountPrice,tax,total})
    }catch(error){
        return res.status(500).json({type:"error",message:"Internal server error"});
    }
}


export default {
    loadCouponPage,
    createCoupon,
    activateCoupon,
    deactiveCoupon,
    editCoupon,
    applayCoupon,
    removeCoupon
}
