import orderSevice from "../Service/orderSevice.js"
import checkoutService from "../Service/checkoutService.js"
import cartService from "../Service/cartService.js"
import helpers from '../helpers/helpers.js'

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
   
    res.render('User/orderDetails',{userName:req.session.userName,profile:req.session.profile,order:order[0]})
}

const cancelOrder = async(req,res)=>{
   
  await orderSevice.updateOrderCancel(req.body.orderId);
  res.redirect('/orders');
}

const placeOrder = async(req,res)=>{

    // single product order


    let order;
      if(req.body?.productId){
        let products;

                const data = await checkoutService.getProduct(req.body.productId,req.body.variantId)
        
                products =[{product:{...data[0]}}]
                products[0].quantity = Number(req.body.quantity);
                const orderDetails =  cartService.cartSummary(products)
                
                const [{product,quantity}] = products
                
              order =  await orderSevice.orderSingleProduct(req.body.productId,req.body.variantId,quantity,req.session._id,product.productName,product.generalPhoto,req.body.payment,req.body,orderDetails,product.variants.price,product.discound)

      }
      else{
        //cart itme order page
        const products =  await cartService.getCartItems(req.session._id)
        const orderDetails =  cartService.cartSummary(products)
        order = await  orderSevice.orderCartItmes(products,orderDetails,req.body,req.session._id);

      }
      const orderId = order.orderId;
      res.render('User/orderPlacedPage',{userName:req.session.userName,profile:req.session.profile,orderId})
}

const returnOrder = (req,res)=>{
  const orderId = req.query.orderId;
  res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId,popup:null});
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
   res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:"Return order request send successfully",type:'success'}})
  }catch(error){
    res.render('User/resendProductPage',{userName:req.session.userName,profile:req.session.profile,orderId:req.body.orderId,popup:{message:error,type:'error'}})
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
    storeReturOrder
}