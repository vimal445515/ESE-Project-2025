import salesReportService from "../Service/salesReportService.js"

const loadSalesReportPage = async(req,res)=>{
    const salesReport = await salesReportService.getSalesReport()
    console.log(salesReport)
    res.status(200).render('Admin/SalesReportPage')
}

export default {
    loadSalesReportPage
}