import salesReportService from "../Service/salesReportService.js"

const loadSalesReportPage = async(req,res)=>{
    const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    console.log(salesReport)
    if(startDate){
        return  res.status(200).json({salesReportData:salesReport});
    }
   
    res.status(200).render('Admin/SalesReportPage',{salesReportData:salesReport});
}

export default {
    loadSalesReportPage
}