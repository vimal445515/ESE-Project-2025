import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'

const getSalesReport = ()=>{
    const salesReport = orderModel.aggregate([
        {$match:{orderStatus:'delivered'}},
        {$group:{_id:null,
            totalOrder:{$sum:1},
            overalOrderAmount:{$sum:'$pricing.subTotal'},
            overalDescountAmount:{$sum:'$pricing.discount'},
            netSales:{$sum:'$pricing.totalAmount'}
        }}
    ])

    return salesReport;
}

export default {
    getSalesReport
}