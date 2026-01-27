import orderModel from "../Models/orderSchema.js"
import {User} from '../Models/userSchema.js'
const analyseDashbordData = async()=>{

    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate   = new Date(`${currentYear}-12-31T23:59:59.999Z`);
    const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    let analyseData;
      

        analyseData = await orderModel.aggregate([
            {
                $match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}},
                
            },
            {$group:{_id:{$month:'$createdAt'},totalSales:{$sum:'$pricing.totalAmount'}}},
        ])


        const chartData = {january: 0, february: 0, march: 0, april: 0,may: 0, june: 0, july: 0, august: 0,september: 0, october: 0, november: 0, december: 0};
        analyseData.forEach(item=>{
           chartData[monthNames[item._id-1]] = item.totalSales;
        })

        const mostSaledProducts = await orderModel.aggregate([
            {$match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}}},
            {$unwind:"$items"},
            {$group:{_id:'$items.productId',totalQuantity:{$sum:"$items.quantity"}}},
            {$group:{_id:null,products:{$push:'$$ROOT'},grandTotal:{$sum:'$totalQuantity'}}},
            {$unwind:'$products'},
            {$project:{
                productId:'$products._id',
                quantity:"$products.totalQuantity",
                persentage:{
                    $round:[
                        {$multiply:[{$divide:['$products.totalQuantity','$grandTotal']},100]},2
                    ]
                }
            }},
            {$sort:{persentage:-1}},
            {$limit:10},
            {$lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"product"
            }},
            {$unwind:"$product"},
            {$project:{
                productId:1,
                quantity:1,
                persentage:1,
                productName:'$product.productName'
            }}  
        ])


         

        

        const totalSales = await orderModel.countDocuments({createdAt:{$gte:startDate,$lte:endDate},orderStatus:"delivered"})
        const totalRevenue = await orderModel.aggregate([
             {$match:{createdAt:{$gte:startDate,$lte:endDate},orderStatus:"delivered"}},
             {$group:{_id:null,totalRevenue:{$sum:"$pricing.totalAmount"}}}
        ])
        const totalUserSginup = await User.countDocuments({createdAt:{$gte:startDate,$lte:endDate}})

         

     
    return {totalSales,totalRevenue:totalRevenue[0].totalRevenue,totalUserSginup,mostSaledProducts,analyseData,chartData}
}

export default {analyseDashbordData}