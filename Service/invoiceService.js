import puppeteer from "puppeteer";
import { invoiceHTML } from "../helpers/invoiceTemplate.js";
import orderSevice from "../Models/orderSchema.js"





export async function generateInvoicePDF(orderId) {
  const order = await orderSevice.findOne({_id:orderId})
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(invoiceHTML(order), {
    waitUntil: "networkidle0"
  });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
}
