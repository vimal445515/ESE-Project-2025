import { generateInvoicePDF } from "../Service/invoiceService.js";

export async function downloadInvoice(req, res) {
  try {
    const orderId = req.params.orderId;

    const pdfBuffer = await generateInvoicePDF(orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${orderId}.pdf`
    );

    res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Invoice download failed" });
  }
}
