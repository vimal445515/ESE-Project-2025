import salesReportService from "../Service/salesReportService.js"
import orderService from '../Service/orderSevice.js'
import helpers from "../helpers/helpers.js"

const loadSalesReportPage = async(req,res)=>{
    console.log(req.query?.page)
    const page = req.query?.page||1
    const limit = 12;
    console.log(req.query.startDate,req.query.endDate)
    const skip = helpers.paginationSkip(page,limit)
    const startDate = req.query.startDate === 'undefined'?undefined:req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate ==='undefined'?undefined:req.query.endDate?new Date(req.query.endDate):null
    
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReport(startDate,endDate,skip,limit);
    
    const count = await orderService.countDeliveredOrders(startDate,endDate)
    if(startDate||req.query.startDate === 'undefined'){
        console.log(salesReport)
        return  res.status(200).json({salesReportData:salesReport,orders,count,limit,page});
    }
   
    res.status(200).render('Admin/SalesReportPage',{salesReportData:salesReport,orders,count,limit,page});
}


const downloadExcelSheet = async(req,res)=>{
    try{
     const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReportDownload(startDate,endDate);
    const workbook =  salesReportService.generateExcelSheet(salesReport,orders)

    res.setHeader(
    'Content-Type',"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)
res.setHeader(
    'Contont-Disposition',
    'attachment; filename=report.xlsx'
)
await workbook.xlsx.write(res);
 res.end();
 }catch(error){
    req.flash('error',"Internal server error")
    res.status(500).redirect('/reports')
 }
  
}

const downloadPDF = async(req,res)=>{
  try{
       const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReportDownload(startDate,endDate);
    const report = await salesReportService.generateReportPDF(salesReport,orders)
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
        "Content-Disposition",
        "attachment; filename=sales-report.pdf"
        );
        res.end(report);

  }catch(error){
    console.log("pdf report error",error)
     req.flash('error',"Internal server error")
    res.status(500).redirect('/reports')
  }
}


export default {
    loadSalesReportPage,
    downloadExcelSheet,
    downloadPDF
}