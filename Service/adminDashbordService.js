import orderModel from "../Models/orderSchema.js"
import {User} from '../Models/userSchema.js'
const analyseDashbordData = async(selectedType,filter)=>{

    let analyseData;
    let mostSaled;
    let chartData;
    let startDate;
    let endDate;

    let currentYear = new Date().getFullYear();
    startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    endDate   = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    //calculate data for month filter
    if(filter  === "Monthly"){

     currentYear = new Date().getFullYear();
    startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    endDate   = new Date(`${currentYear}-12-31T23:59:59.999Z`);
    const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];

    

        analyseData = await orderModel.aggregate([
            {
                $match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}},
                
            },
            {$group:{_id:{$month:'$createdAt'},totalSales:{$sum:'$pricing.totalAmount'}}},
        ])


                 chartData = {january: 0, february: 0, march: 0, april: 0,may: 0, june: 0, july: 0, august: 0,september: 0, october: 0, november: 0, december: 0};
                 analyseData.forEach(item=>{
                 chartData[monthNames[item._id-1]] = item.totalSales;
        })
    }

    //claculate data for week filter
    else if(filter === 'Weekly'){
                const today = new Date();

                const day = today.getDay();


                const diffToMonday = day === 0 ? -6 : 1 - day;
                startDate = new Date(today);
                startDate.setDate(today.getDate() + diffToMonday);
                startDate.setHours(0,0,0,0);



                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23,59,59,999);

             chartData = {"Sun":0,"Mon":0,"Tue":0,"Wed":0,"Thu":0,"Fri":0,"Sat":0}
             const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

              analyseData = await orderModel.aggregate([
            {
                $match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}},
                
            },
            {$group:{_id:{$dayOfWeek:'$createdAt'},totalSales:{$sum:'$pricing.totalAmount'}}},
            
        ])
        analyseData.forEach(item=>{
                 chartData[dayName[item._id-1]] = item.totalSales;
        })



        //Calculating data for year filter
    }else if(filter === 'Yearly'){
        const years = []
        startDate = new Date(`${2025}-01-01T00:00:00.000Z`)
        analyseData = await orderModel.aggregate([
            {
                $match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}},
                
            },
            {$group:{_id:{$year:'$createdAt'},totalSales:{$sum:'$pricing.totalAmount'}}},
            {$sort:{_id:1}}
        ])
        chartData = {}
        for(let i = startDate.getFullYear(); i < endDate.getFullYear(); i++){
            years.push(i);
            chartData[i] = 0
        }

        analyseData.forEach(item=>{
            chartData[item._id] = item.totalSales;
        })


    } 
    // calculating daily data for chart
    else if(filter ==="Daily"){
        startDate = new Date()
        startDate.setHours(0,0,0,0)
        endDate =  new Date()
        endDate.setHours(23,59,59,999)
        chartData = {}
        analyseData = await orderModel.aggregate([
            {
                $match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}},  
            },
            {$group:{_id:'$createdAt',totalSales:{$sum:'$pricing.totalAmount'}}}
        ])

        let today = analyseData[0]?._id||new Date()
        let date = new Date().toString(today).slice(0,10)
        chartData[date] = analyseData[0]?.totalSales||0;
    }

    


       
        if(selectedType === "Product"){
         mostSaled = await orderModel.aggregate([
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
           }else{
             mostSaled = await orderModel.aggregate([
                 {$match:{orderStatus:"delivered",createdAt:{$gte:startDate,$lte:endDate}}},
                  {$unwind:"$items"},
                   {$group:{_id:'$items.categoryId',totalQuantity:{$sum:"$items.quantity"}}},
                    {$group:{_id:null,categories:{$push:'$$ROOT'},grandTotal:{$sum:'$totalQuantity'}}},
                    {$unwind:'$categories'},

                     {$project:{
                categoryId:'$categories._id',
                quantity:"$categories.totalQuantity",
                persentage:{
                    $round:[
                        {$multiply:[{$divide:['$categories.totalQuantity','$grandTotal']},100]},2
                    ]
                }
            }},
             {$sort:{persentage:-1}},
            {$limit:10},
            {$lookup:{
                from:"categories",
                localField:"categoryId",
                foreignField:"_id",
                as:"category"
            }},
            {$unwind:"$category"},
            {$project:{
                categoryId:1,
                quantity:1,
                persentage:1,
                productName:'$category.categoryName'
            }} 

             ])


           }

         

        

        const totalSales = await orderModel.countDocuments({createdAt:{$gte:startDate,$lte:endDate},orderStatus:"delivered"})
        const totalRevenue = await orderModel.aggregate([
             {$match:{createdAt:{$gte:startDate,$lte:endDate},orderStatus:"delivered"}},
             {$group:{_id:null,totalRevenue:{$sum:"$pricing.totalAmount"}}}
        ])
        const totalUserSginup = await User.countDocuments({createdAt:{$gte:startDate,$lte:endDate}})

         
     
    return {totalSales:totalSales||0,totalRevenue:totalRevenue[0]?.totalRevenue||0,totalUserSginup:totalUserSginup||0,mostSaled,analyseData,chartData}
}

export default {analyseDashbordData}