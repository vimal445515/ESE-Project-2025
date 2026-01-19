import orderSevice from "../Service/orderSevice.js"
import checkoutService from "../Service/checkoutService.js"
import cartService from "../Service/cartService.js"
import helpers from '../helpers/helpers.js'
import categoryService from "../Service/categoryService.js"
import productService from "../Service/productService.js"
import { startSession } from "mongoose"
import couponService from '../Service/couponService.js'

const loadOrdersHistory = async(req,res)=>{
    
        const page = req.query.page||1
        const limit = 7;
        const skip = helpers.paginationSkip(page,limit)
        const orders =  await orderSevice.getOrders(req.session._id,skip,limit)
        const count = await orderSevice.countOrders(req.session._id);
        res.render('User/orders',{userName:req.session.userName,profile:req.session.profile,orders,page,limit,skip,count})
}

const loadOrderDetailPage = async(req,res)=>{
    const order = await orderSevice.getSingleOrder(req.params.id)
   
    res.render('User/orderDetails',{userName:req.session.userName,profile:req.session.profile,order:order[0],type:null})
}

const cancelOrder = async(req,res)=>{
   
  await orderSevice.updateOrderCancel(req.body.orderId);
  res.redirect('/orders');
}

const placeOrder =  async(req,res)=>{

    // single product order
    
 
    let order;
      if(req.body?.productId){
        let products;
              
              if( !await orderSevice.checkOrderStock(req.body.productId,req.body.variantId)){
               req.flash("error","This product is out of stock now");
               return res.status(410).json({type:"error",href:`/productDetails/${req.body.productId}`})
              // return res.redirect(`/productDetails/${req.body.productId}`)
              }

               if(await categoryService.isBlocked(req.body.categoryId)){
                      req.flash("error","This product currently unavailable")
                      return res.status(410).json({type:"error",href:`/productDetails/${req.body.productId}`})
                    //  return res.redirect(`/productDetails/${req.body.productId}`);
              }

              const isBlock = await productService.isBlocked(req.body.productId)
            if(isBlock.length === 0) {
             req.flash("error","This product currently unavailable")
              return res.status(410).json({type:"errro",href:`/productDetails/${req.body.productId}`})
              // return res.redirect(`/productDetails/${req.body.productId}`);
                        };

                
        
                 products = await checkoutService.getProduct(req.body.productId,req.body.variantId)
                products[0].quantity = Number(req.body.quantity);

                if(req.body.appliedCoupon){

                    const orderDetails = await couponService.applayCouponCodeInTotalAmount(products,req.body.appliedCoupon,req.session._id)
                    const [{product,quantity}] = orderDetails.products
                    console.log("this is the result :",orderDetails.products)
                    order =  await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails,product.variants?.price,product.discound,orderDetails.products[0].finalPrice,req.body.appliedCoupon)
                }
                else{

                
                    const orderDetails =  cartService.cartSummary(products)
                  
                    const [{product,quantity}] = products
                    if(req.body.payment === 'razorpay'){
                      order =  await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails,product.variants?.price,product.discound,products[0].finalPrice)
                      return res.status(200).json({type:"razorpay",orderId:order.orderId})
                    }else if(req.body.payment === 'wallet'){
                      try{
                         order =  await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails,product.variants?.price,product.discound,products[0].finalPrice)
                      }catch(error){
                        console.log(error)
                        return res.status(400).json({type:"walletError",message:error.message});
                      }
                      
                    }else{
                       order =  await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails,product.variants?.price,product.discound,products[0].finalPrice)
                    }
                   
                }
              

      }
      else{
        //cart itme order page
        const signal = await cartService.cartItemsBlocked(req.session._id)
        if(signal.flag){
          req.flash("error",`[${signal.message}] unavailable`);
          return res.status(410).json({type:"errro",href:`/cart`})
          // return res.redirect('/cart')
        }
        const products =  await cartService.getCartItems(req.session._id)
        const status = await orderSevice.checkOrderStockForCart(products)
        if(! status.flag || products.length === 0){
          req.flash('error',`!Oops [${status.outOfStockProducts}]  out of stock`);
          return res.status(410).json({type:"errro",href:`/cart`})
        //  return res.redirect('/cart')
        }
        else{
          if(req.body.appliedCoupon){
            const orderDetails = await couponService.applayCouponCodeInTotalAmount(products,req.body.appliedCoupon,req.session._id)
             order = await  orderSevice.orderCartItmes(orderDetails.products,orderDetails,req.body,req.session._id,req.body.appliedCoupon);
          }else{
            const orderDetails =  cartService.cartSummary(products)
             if(req.body.payment === 'razorpay'){
              order = await  orderSevice.orderCartItmes(products,orderDetails,req.body,req.session._id);
              return res.status(200).json({type:"razorpay",orderId:order.orderId})
             }else if(req.body.payment === 'wallet'){
                      try{
                           order = await  orderSevice.orderCartItmes(products,orderDetails,req.body,req.session._id);
                      }catch(error){
                        console.log(error)
                        return res.status(400).json({type:"walletError",message:error.message});
                      }
                     } else{
              order = await  orderSevice.orderCartItmes(products,orderDetails,req.body,req.session._id);
             }
          }
        
        }

      }
      const orderId = order.orderId;
       return res.status(200).json({type:'success',href:`orders/orderSuccess?orderId=${orderId}`})
      res.render('User/orderPlacedPage',{userName:req.session.userName,profile:req.session.profile,orderId})
}

const loadOrPlacedPage = (req,res)=>{
  res.status(200).render('User/orderPlacedPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.query.orderId})
}

const loadOrderFailurePage = (req,res)=>{
  res.status(404).render('User/orderFailurePage',{userName:req.session.userName,profile:req.session.profile,orderId:req.query.orderId,productOrderId:req.query.productOrderId,reason:req.query.reason})
}

const returnOrder = (req,res)=>{
  const orderId = req.query.orderId;
  const productId = req.query?.productId?req.query?.productId:null;
  const variantId = req.query?.variantId?req.query?.variantId:null;
  res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId,popup:null,productId,variantId});
}

const search = async(req,res)=>{
  console.log(req.body.value)
    const search = req.body.value
    const userId = req.session._id
  const data =  await orderSevice.searchByUser(userId,search)
  res.render('User/orders',{userName:req.session.userName,profile:req.session.profile,orders:data,page:1,count:null,limit:null});
}


const loadOrderScucessPage = (req,res)=>{
  const orderId = req.params.orderId
  console.log(orderId)
  res.render('User/orderPlacedPage');
}


const storeReturOrder  = async(req,res)=>{
  try{
     await orderSevice.storeReturnOrderData(req.body.orderId,req.body.reason)
   res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:"Return order request send successfully",type:'success'},productId:null})
  }catch(error){
    res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:error,type:'error'},productId:null})
  }
}

const cancelProduct = async(req,res)=>{
   const orderId = await orderSevice.cancelSingleProduct(req.body.orderId,req.body.productId,req.body.variantId,req.body.quantity);
   
    res.redirect(`/orders/orderDetails/${orderId.orderId}`)
}


const returnSingleProduct= async(req,res)=>{
   try{
     await orderSevice.storeSingleReturnOrderData(req.body.orderId,req.body.reason,req.body.productId,req.body.variantId)
   res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:"Return order request send successfully",type:'success'},productId:req.body.productId,variantId:req.body.variantId})
  }catch(error){
    res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:error,type:'error'},productId:req.body.productId,variantId:req.body.variantId})
  }
}



export default {
    loadOrdersHistory,
    loadOrderDetailPage,
    placeOrder,
    cancelOrder,
    returnOrder,
    search,
    loadOrderScucessPage,
    storeReturOrder,
    cancelProduct,
    returnSingleProduct,
    loadOrPlacedPage,
    loadOrderFailurePage
}