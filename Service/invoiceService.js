import puppeteer from "puppeteer";
import { invoiceHTML } from "../helpers/invoiceTemplate.js";
import orderSevice from "../Models/orderSchema.js"





export async function generateInvoicePDF(orderId) {
  const order = await orderSevice.findOne({_id:orderId,})
  for(let index = 0; index <order.items.length; index++){
    if(order.items[index].status === 'cancelled'){
      order.items.splice(index,1)
    }
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(invoiceHTML(order), {
    waitUntil: "domcontentloaded"
  });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
}
