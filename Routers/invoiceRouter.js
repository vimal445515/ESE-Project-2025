import express from "express";
import { downloadInvoice } from "../Controllers/invoiceController.js";

const router = express.Router();

router.get("/invoice/:orderId", downloadInvoice);

export default router;
