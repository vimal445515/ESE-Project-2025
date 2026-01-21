import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'

const getSalesReport = (startDate,endDate)=>{
    
    const pipeline = []
    if(startDate){
       
         pipeline.push({$match:{createdAt:{$gte:startDate,$lte:endDate}}})
    }
    
    pipeline.push({$match:{orderStatus:'delivered'}},
        {$group:{_id:null,
            totalOrder:{$sum:1},
            overalOrderAmount:{$sum:'$pricing.subTotal'},
            overalDescountAmount:{$sum:'$pricing.discount'},
            netSales:{$sum:'$pricing.totalAmount'}
        }})

       

    const salesReport = orderModel.aggregate(pipeline)

    return salesReport;
}

export default {
    getSalesReport
}