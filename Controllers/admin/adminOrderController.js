import orderSevice from '../../Service/orderSevice.js';
import orderService from '../../Service/orderSevice.js'
import helpers from '../../helpers/helpers.js'
import mongoose from 'mongoose'
const loadOrderPage = async(req,res)=>{
    const page = req.query.page||1
    const limit = 8;
    const sort = req.query.sort
    const search = req.query.search
    const filter = req.query.filter
    const skip = helpers.paginationSkip(page,limit)
    const count = await orderService.getAllOrdersCount()
    const orders = await orderService.getAllOrders(skip,limit,sort,search,filter)
    const notifications = await orderSevice.getAllReturnNotifications()
   res.render('Admin/orderPage',{orders,skip,limit,page,count,sort,search,filter,notifications:notifications||[]})
}

const loadEditOrderPage = async (req,res)=>{
    const {id:orderId}=req.params
    const order = await orderService.getSingleOrderById(orderId)
    res.render('Admin/editOrder',{order})
}

const deleteOrder = async(req,res)=>{
    const orderId = req.body.orderId
    
    if(req.body.isDeleted === 'true'){
        
        await orderSevice.unlistOrder(req.body.orderId)
    }else{
       await orderService.listOrder(req.body.orderId);
    }

   res.redirect("/admin/order")
}

const updateOrderStatus = async(req,res)=>{
    console.log(req.body)
    await orderSevice.updateData(req.body.id,req.body.value)
    res.status(200).json({data:"success"});
}

const search = async(req,res)=>{
    const search = req.query.value
    const sort = req.query.sort
    console.log("this is sort",sort)
  const data =  await orderSevice.getOrderById(search,sort)
  const notifications = await orderSevice.getAllReturnNotifications()
  
  res.render('Admin/orderPage',{orders:data,page:1,count:null,limit:null,sort,notifications:notifications||[]});
}


const rejectReturnOrder = async(req,res)=>{
    const orderId = req.params.orderId
    const type = req.query.type
    if(type ==='all'){
           await orderSevice.deletereturnOrder(orderId,type)
           return res.json({type:"success"})
    }
    else{
           await orderSevice.rejectSingleReturnProduct(orderId,req.query.variantId,req.query.productId); 
         return res.json({type:"success"}) 
    }
 
}


const updateOrderReturnstatus = async(req,res) =>{
    const orderId = req.params.orderId
    if(req.query.type === 'all'){
   try{
    await orderSevice.acceptOrderReturn(orderId,req.session._id)
    res.json({type:"success",message:"Order return accepted success fully"})
   }catch(error){
    res.json({type:"error",message:" oops somthing was wrong!"})
   }
   }else{
    try{
    await orderService.aproveSingleReturnProduct(orderId,req.query.variantId,req.query.productId)
    res.json({type:"success",message:"Order return accepted success fully"})
    }catch(error){
    res.json({type:"error",message:" oops somthing was wrong!"})
   }
   }
}
export default {
    loadOrderPage,
    loadEditOrderPage,
    deleteOrder,
    updateOrderStatus,
    search,
    rejectReturnOrder,
    updateOrderReturnstatus
}