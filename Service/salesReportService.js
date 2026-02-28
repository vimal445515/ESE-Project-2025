import mongoose from "mongoose";
import orderModel from "../Models/orderSchema.js";
import excelJS from "exceljs";
import { salesReportHtml } from "../helpers/salesReportHtml.js";
import puppeteer from "puppeteer";

const getSalesReport = (startDate, endDate) => {
  const pipeline = [];
  if (startDate) {
    pipeline.push({
      $match: { createdAt: { $gte: startDate, $lte: endDate } },
    });
  }

  pipeline.push(
    { $match: { orderStatus: "delivered" } },
    {
      $group: {
        _id: null,
        totalOrder: { $sum: 1 },
        overalOrderAmount: { $sum: "$pricing.subTotal" },
        overalDiscountAmount: { $sum: "$pricing.discount" },
        overalTax: { $sum: "$pricing.tax" },
        netSales: { $sum: "$pricing.totalAmount" },
      },
    },
    { $sort: { createdAt: -1 } },
  );

  const salesReport = orderModel.aggregate(pipeline);
  return salesReport;
};

const generateExcelSheet = (reportData, orders, startDate, endDate) => {
  const workbook = new excelJS.Workbook();

  const sheet = workbook.addWorksheet("Sales report");
  sheet.addRow(["SALES SUMMARY"]);
  if (startDate) {
    sheet.addRow([
      "Date",
      `${startDate?.toISOString().slice(0, 10)}  To  ${endDate?.toISOString().slice(0, 10)}`,
    ]);
  }
  sheet.addRow(["Total Order", reportData[0].totalOrder]);
  sheet.addRow([
    "Overal Order Amount",
    `₹${reportData[0].overalOrderAmount.toFixed(2)}`,
  ]);
  sheet.addRow([
    "Overal Discount Amount",
    `₹${reportData[0].overalDiscountAmount.toFixed(2)}`,
  ]);
  sheet.addRow(["Net Sales", `₹${reportData[0].netSales.toFixed(2)}`]);
  sheet.addRow([]);

  sheet.addRow([]);
  sheet.addRow([]);

  sheet.columns = [
    { key: "totalOrder", width: 30 },
    { key: "overalOrderAmount", width: 15 },
    { key: "overalDiscountAmount", width: 20 },
    { key: "overalTax", width: 15 },
    { key: "netSales", width: 15 },
  ];

  sheet.addRow([
    "Order ID",
    "Customer Name",
    "Date",
    "Sub Total",
    "Offer Discount",
    "Coupon Discount",
    "Tax(GST)",
    "totalAmount",
  ]);

  orders.forEach((order) => {
    console.log(orders);
    sheet.addRow([
      order.orderId,
      order.user[0]?.userName || "",
      order.createdAt.toISOString().slice(0, 10),
      `₹${order.pricing.subTotal.toFixed(2)}`,
      `₹${order.pricing.offerDiscount.toFixed(2)}`,
      `₹${order.pricing.couponDiscount.toFixed(2)}`,
      `₹${order.pricing.tax.toFixed(2)}`,
      `₹${order.pricing.totalAmount.toFixed(2)}`,
    ]);
  });

  return workbook;
};

export async function generateReportPDF(
  salesReport,
  orders,
  startDate,
  endDate,
) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    const page = await browser.newPage();
    let dateHtml = "";
    if (startDate) {
      dateHtml = `<div class="row mb-4">
    <div class="col">
      <div class="kpi-card">
        <strong>Date</strong><br>
        ${startDate?.toISOString()?.slice(0, 10)}  To  ${endDate?.toISOString()?.slice(0, 10)}
      </div>
    </div> `;
    }

    await page.setContent(salesReportHtml(salesReport, orders, dateHtml), {
      waitUntil: "domcontentloaded",
    });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await page.close();
    return pdfBuffer;
  } catch (error) {
    console.log(error);
  }
}

export default {
  getSalesReport,
  generateExcelSheet,
  generateReportPDF,
};
