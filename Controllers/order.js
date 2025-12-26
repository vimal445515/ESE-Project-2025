import orderSevice from "../Service/orderSevice.js"
import checkoutService from "../Service/checkoutService.js"
import cartService from "../Service/cartService.js"
import helpers from '../helpers/helpers.js'
const loadOrdersHistory = async(req,res)=>{
    
        const page = req.query.page||1
        const limit = 8;
        const skip = helpers.paginationSkip(page,limit)
        const orders =  await orderSevice.getOrders(req.session._id,skip,limit)
        const count = await orderSevice.countOrders(req.session._id);
        res.render('User/orders',{userName:req.session.userName,profile:req.session.profile,orders,page,limit,skip,count})
}

const loadOrderDetailPage = (req,res)=>{
    res.render('User/orderDetails',{userName:req.session.userName,profile:req.session.profile})
}

const loadOrderCancelPage = (req,res)=>{
    (req,res)=>{
   res.render('User/orderCancelPage',{userName:req.session.userName,profile:req.session.profile})
}
}

const placeOrder = async(req,res)=>{
    // single product order
      if(req.body?.productId){
        let products;

                const data = await checkoutService.getProduct(req.body.productId,req.body.variantId)
        
                products =[{product:{...data[0]}}]
                products[0].quantity = Number(req.body.quantity);
                const orderDetails =  cartService.cartSummary(products)
                
                const [{product,quantity}] = products
                await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails)

      }
      else{
        //cart itme order page
        const products =  await cartService.getCartItems(req.session._id)
        const orderDetails =  cartService.cartSummary(products)
        orderSevice.orderCartItmes(products,orderDetails,req.body,req.session._id);

      }
}

export default {
    loadOrdersHistory,
    loadOrderDetailPage,
    loadOrderCancelPage,
    placeOrder
}