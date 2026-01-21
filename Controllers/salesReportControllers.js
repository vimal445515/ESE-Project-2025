import salesReportService from "../Service/salesReportService.js"

const loadSalesReportPage = async(req,res)=>{
    const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    console.log(startDate,endDate)
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    console.log(salesReport)
    res.status(200).render('Admin/SalesReportPage')
}

export default {
    loadSalesReportPage
}