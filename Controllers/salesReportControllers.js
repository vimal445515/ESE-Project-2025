import salesReportService from "../Service/salesReportService.js"
import orderService from '../Service/orderSevice.js'

const loadSalesReportPage = async(req,res)=>{
    const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date(req.query.endDate):null
    console.log(startDate,endDate)
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReport(startDate,endDate);
 
    if(startDate){
        console.log(salesReport)
        return  res.status(200).json({salesReportData:salesReport,orders});
    }
   
    res.status(200).render('Admin/SalesReportPage',{salesReportData:salesReport,orders});
}


const downloadExcelSheet = async(req,res)=>{
    
     const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReport(startDate,endDate);
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
  
}

const downloadPDF = async(req,res)=>{
  try{
       const startDate = req.query.startDate?new Date( req.query.startDate):null
    const endDate = req.query.endDate?new Date( req.query.endDate):null
    const salesReport = await salesReportService.getSalesReport(startDate,endDate)
    const orders = await orderService.getOrdersForSalesReport(startDate,endDate);
    const report = await salesReportService.generateReportPDF(salesReport,orders)
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
        "Content-Disposition",
        "attachment; filename=sales-report.pdf"
        );
        res.end(report);

  }catch(error){
    console.log("pdf report error",error)
    res.status(500).json('pdf error')
  }
}


export default {
    loadSalesReportPage,
    downloadExcelSheet,
    downloadPDF
}