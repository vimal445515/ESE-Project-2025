import address from "../Service/addressService.js";
import cartService from "../Service/cartService.js"
import checkoutService from "../Service/checkoutService.js";
import productService from '../Service/productService.js'
import categoryService from '../Service/categoryService.js'


const loadCheckOutPage = async (req,res)=>{

    const path = req.headers.referer.split('/').pop().trim()
    let products;
    if(path ==="cart"){
           products =  await cartService.getCartItems(req.session._id)
           
    }
    else{
        const data = await checkoutService.getProduct(req.query.productId,req.query.variantId)
        products =[{product:{...data[0]}}]
        products[0].quantity = Number(req.query.quantity);
        
    }

    const isBlock = await productService.isBlocked(req.query.productId)
     if(await categoryService.isBlocked(req.query.categoryId)) return res.redirect('/products');
      if(isBlock.length === 0) return res.redirect('/');
   
     const orderDetails = await cartService.cartSummary(products)
     const defaultAddress  = await address.getUserAddress(req.session._id)
     const allAddress = await address.getAllAddressForCheckout(req.session._id)
            
     res.render('User/checkout',{userName:req.session.userName,profile:req.session.profile,_id:req.session._id,defaultAddressId:defaultAddress?._id,allAddress,products,orderDetails,productId:req?.query?.productId,variantId:req?.query?.variantId});
   
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
