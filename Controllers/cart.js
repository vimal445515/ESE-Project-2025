import cartService from '../service/cartService.js'

const leadCartPage = async(req,res) =>{
   
   const cartItems = await  cartService.getCartItems(req.session._id)
   const subTotal = cartService.cartSummary(cartItems)
    res.render('User/cart',{userName:req.session.userName,profile:req.session.profile,status:null,message:null,cartItems:cartItems,subTotal});
}
const addToCart = async (req,res) =>{
    
 try{
   if( await cartService.checkcartItem(req.body.productId,req.body.variantId)){
      
      if(req.body?.decrement){
       if(req.body?.quantity >1){
          await cartService.decrementQuantity(req.body.productId,req.body.variantId)
       return res.redirect('/cart')
       }
       
       return res.redirect("/cart")
      }

      console.log(req.body?.quantity)
      if(req.body?.quantity < 10){
         
          await cartService.incrementQuantity(req.body.productId,req.body.variantId)
      return res.redirect('/cart');
      }
      else{
       
         return res.redirect("/cart")
      }
      
      
   }
    await cartService.addProduct(req.body.productId,req.body.variantId,req.session._id,req.body.quantity)
    res.redirect('/cart')
 }catch(error){
      res.render('User/cart',{userName:req.session.userName,profile:req.session.profile,status:"error",message:error.message});
 }
    
}


const deleteCartItem = async(req,res)=>{
    try{
     await cartService.deleteCartItemFromDB(req.body._id);
     res.status(200).json({success:true,href:"/cart"})
    }catch(error){
      res.status(500).json({success:false,message:error.message})
    }
}
export default {
   leadCartPage,
   addToCart,
   deleteCartItem
}