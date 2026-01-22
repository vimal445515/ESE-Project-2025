import salesReportService from "../Service/salesReportService.js"
import orderService from '../Service/orderSevice.js'

const loadSalesReportPage = async(req,res)=>{
    const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    console.log(startDate,endDate)
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReport(startDate,endDate);
 
    if(startDate){
        console.log(salesReport)
        return  res.status(200).json({salesReportData:salesReport,orders});
    }
   
    res.status(200).render('Admin/SalesReportPage',{salesReportData:salesReport,orders});
}

export default {
    loadSalesReportPage
}