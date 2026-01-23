import mongoose from 'mongoose'
import orderModel from '../Models/orderSchema.js'
import excelJS from 'exceljs'
import {salesReportHtml} from '../helpers/salesReportHtml.js'
import puppeteer from 'puppeteer'

const getSalesReport = (startDate,endDate)=>{
    
    const pipeline = []
    if(startDate){
       
         pipeline.push({$match:{createdAt:{$gte:startDate,$lte:endDate}}})
    }
    
    pipeline.push({$match:{orderStatus:'delivered'}},
        {$group:{_id:null,
            totalOrder:{$sum:1},
            overalOrderAmount:{$sum:'$pricing.subTotal'},
            overalDiscountAmount:{$sum:'$pricing.discount'},
            overalTax:{$sum:'$pricing.tax'},
            netSales:{$sum:'$pricing.totalAmount'}
        }})

       

    const salesReport = orderModel.aggregate(pipeline)
    return salesReport;
}

const generateExcelSheet= (reportData,orders)=>{
        const workbook = new excelJS.Workbook();
        const sheet = workbook.addWorksheet('Sales report');
        sheet.addRow(["SALES SUMMARY"]);
        sheet.addRow(['Total Order',reportData[0].totalOrder])
        sheet.addRow(['Overal Order Amount',`₹${reportData[0]. overalOrderAmount}`])
        sheet.addRow(['Overal Discount Amount',`₹${reportData[0].overalDiscountAmount}`])
        sheet.addRow(['Net Sales',`₹${reportData[0].netSales}`])
        sheet.addRow([]);

        sheet.addRow([]);
          sheet.addRow([]);

            sheet.columns = [
    { key: "totalOrder", width: 30 },
    { key: "overalOrderAmount", width: 15 },
    {  key: "overalDiscountAmount", width: 20 },
    {  key: "overalTax", width: 15 },
    {  key: "netSales", width: 15 }
  ];


     sheet.addRow(["Order ID","Customer Name", "Date","Sub Total", "Offer Discount", "Coupon Discount","Tax(GST)", "totalAmount"]);


     orders.forEach(order=>{
        console.log(orders)
        sheet.addRow([order.orderId, 
            order.user[0].userName,
            order.createdAt.toString().slice(0,10),
           `₹${Math.floor(order.pricing.subTotal)}`,
           `₹${ Math.floor(order.pricing.offerDiscount)}`, 
            `₹${Math.floor(order.pricing.couponDiscount)}`,
            `₹${Math.floor(order.pricing.tax)}` 
           `₹${Math.floor(order.pricing.totalAmount)}`]);
     })

return workbook;


}


export async function generateReportPDF(salesReport,orders) {
  
  try{
    const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(salesReportHtml(salesReport,orders), {
    waitUntil: "networkidle0"
  });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
  }catch(error){
    console.log(error)
  }
}



export default {
    getSalesReport,
    generateExcelSheet,
    generateReportPDF
}