import address from "../Service/addressService.js";
import cartService from "../Service/cartService.js"
import checkoutService from "../Service/checkoutService.js";
import productService from '../Service/productService.js'
import categoryService from '../Service/categoryService.js'
import orderSevice from "../Service/orderSevice.js";
import couponService from "../Service/couponService.js";


const loadCheckOutPage = async (req,res)=>{

    const path = req.headers?.referer?.split('/')?.pop()?.trim()
    let products;
    if(path ==="cart"){
          products =  await cartService.getCartItems(req.session._id)
          console.log(products)
          if(products.length === 0) return res.status(200).redirect('/cart');
          const status =  await orderSevice.checkOrderStockForCart(products)
            if(! status.flag || products.length ==0){
                console.log("this is working")
                req.flash('error',`[${status.outOfStockProducts}] out of stock!`)
                return res.redirect('/cart');
            }

                 const signal = await cartService.cartItemsBlocked(req.session._id)
                 if(signal.flag){
                 req.flash("error",`[${signal.message}] is unavailable`);
                 return res.redirect('/cart')
               }
           
    }
    else{
            if(!await orderSevice.checkOrderStock(req.query.productId,req.query.variantId)){
                req.flash('error','product is out of stock!')
                return res.redirect(`/productDetails/${req.query.productId}?variantId=${req.query.variantId}`)
            }
            const validationData = await orderSevice.checkOrderStockAndQuantity(req.query.productId,req.query.variantId,Number(req.query.quantity))
            if(!validationData.valid){
                 req.flash('error',`Only ${validationData.stock} Stock available!`)
                return res.redirect(`/productDetails/${req.query.productId}?variantId=${req.query.variantId}`)
            }

        products = await checkoutService.getProduct(req.query.productId,req.query.variantId)
        products[0].quantity = Number(req.query.quantity);
     
          const isBlock = await productService.isBlocked(req.query.productId)
          if(isBlock.length === 0) {
            req.flash("error","This product currently unavailable")
        return res.redirect(`/productDetails/${req.query.productId}`);
          };

          
        if(await categoryService.isBlocked(req.query.categoryId)){
        req.flash("error","This product currently unavailable")
        return res.redirect(`/productDetails/${req.query.productId}`);
     } 
        
    }

    
     const orderDetails =  cartService.cartSummary(products)
     req.session.amount = orderDetails.total;
     const defaultAddress  = await address.getUserAddress(req.session._id)
     const allAddress = await address.getAllAddressForCheckout(req.session._id)
     const coupons = await  couponService.getCouponsForCheckout(orderDetails,req.session._id)
     
     res.render('User/checkout',{userName:req.session.userName,profile:req.session.profile,_id:req.session._id,defaultAddressId:defaultAddress?._id,allAddress,products,orderDetails,productId:req?.query?.productId,categoryId:req.query.categoryId,variantId:req?.query?.variantId,type:null,message:null,coupons});
   
}

const displayAddress = async (req,res) =>{
    const {addressId} = req.body
    const addressData =  await address.findAddressFromDB(addressId)
    res.status(200).json(addressData)
}

export default {
    loadCheckOutPage,
    displayAddress
}
