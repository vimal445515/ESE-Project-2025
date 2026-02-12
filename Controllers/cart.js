import cartService from '../service/cartService.js'
import productService from '../Service/productService.js'
import categoryService from '../Service/categoryService.js'
import orderSevice from '../Service/orderSevice.js'
const leadCartPage = async(req,res) =>{
   
   const cartItems = await  cartService.getCartItems(req.session._id)
  
   req.headers.referer.split('/').pop().trim()==='wishlist'
   const subTotal = cartService.cartSummary(cartItems)
    res.render('User/cart',{userName:req.session.userName,profile:req.session.profile,status:null,message:null,cartItems:cartItems,subTotal});
}
const addToCart = async (req,res) =>{
   try{
   const isBlock = await productService.isBlocked(req.body.productId)
    if(!await orderSevice.checkOrderStock(req.body.productId,req.body.variantId)){
                   req.flash('error','product is out of stock!')
                   if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(400).redirect('/wishlist');
                   return res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`)
      }

      

      if(req.body.categoryId !== undefined){
         console.log(req.body.categoryId)
         if(await categoryService.isBlocked(req.body.categoryId)){
         console.log("this is working")
         req.flash("error","This product 1 is unavailable now");
         if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(404).redirect('/wishlist');
         return res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`)
        }
        }

   if(isBlock.length === 0){
      req.flash("error","This product is unavailable now");
        if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(404).redirect('/wishlist');
      return res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`)
   }
      const stock = await cartService.getCartSingleItem(req.body.productId,req.body.variantId)
      const cartData = await cartService.getCartQuantity(req.body.productId,req.body.variantId)

if(req.body.categoryId !== undefined){
   
    if(isBlock.length === 0) return res.redirect('/');
  }
  
 try{
   if( await cartService.checkcartItem(req.body.productId,req.body.variantId)){
      
      if(req.body?.decrement){
       if(req.body?.quantity >1){
          await cartService.decrementQuantity(req.body.productId,req.body.variantId)
          let item = await cartService.getCartSingleItem(req.body.productId,req.body.variantId);
          const cartItems = await  cartService.getCartItems(req.session._id)
          const subTotal = cartService.cartSummary(cartItems)
          return  res.status(200).json({type:"suceess",stock:item[0].variants.stock,subTotal})
         
       }
       
       return res.json({type:"error"});
      }

     
      
       let quantity =req.body?.quantity
       if(req.headers.referer.split('/').pop().trim()==="cart"){
            quantity = 1
         }

         if(cartData.quantity + Number(quantity) > 5){
               req.flash("error",`Sorry you can only add 5 items`)
             return res.redirect('cart')
            }
            
      if(cartData.quantity + Number(quantity) > stock[0].variants.stock){
         if(req.body?.increment){
            req.flash("error",`Only ${stock[0].variants.stock} items available`)
            return res.json({type:"error"})
         }
         req.flash("error",`Only ${stock[0].variants.stock} items available`)
         return res.redirect('/cart');
      }
     
      if(Number(req.body?.quantity) <= stock[0].variants.stock & req.body?.quantity <= 5){
          if(req.body?.increment){
            await cartService.incrementQuantity(req.body.productId,req.body.variantId,Number(quantity))
           let item = await cartService.getCartSingleItem(req.body.productId,req.body.variantId);
            let cartItems = await  cartService.getCartItems(req.session._id)
            let subTotal = cartService.cartSummary(cartItems)
            console.log('this is cart times',cartItems);
            return res.status(200).json({type:"suceess",stock:item[0].variants.stock,subTotal})
          }else{
             await cartService.incrementQuantity(req.body.productId,req.body.variantId,Number(quantity))
             req.flash('success','Product added to cart')
            if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(200).redirect('/wishlist');
            return res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`)
          }
      }
      else{
          if(req.body?.increment){
          req.flash("error",`Only ${stock[0].variants.stock} items available`)
          return res.json({type:"error"})
          }else{
            
             req.flash("error",`Only ${stock[0].variants.stock} items available`)
             if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(200).redirect('/wishlist');
             return res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`)
          }
      }
      
      
   }
    if(Number(req.body?.quantity) > stock[0].variants.stock) throw new Error(`Only ${stock[0].variants.stock} stock available`);
    await cartService.addProduct(req.body.productId,req.body.variantId,req.session._id,parseInt(req.body.quantity))
    req.flash('success','Product added to cart')
   if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(200).redirect('/wishlist');
    res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`);
 }catch(error){
      console.log(error)
      req.flash('error',error.message)
      if( req.headers.referer.split('/').pop().trim()==='wishlist') return res.status(200).redirect('/wishlist');
      res.redirect(`/productDetails/${req.body.productId}?variantId=${req.body.variantId}`);
 }
    }catch(error){
      console.log(error)
      if(req.headers.referer.split('/').pop().trim()==="cart"){
         req.flash('error','Internal server error');
        return res.status(500).json({type:"error"});
      }

      return res.status(500).redirect('/500Error');
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