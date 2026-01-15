import { Router } from "express";
import offerController from "../Controllers/offerController.js";
const router = Router();

router.get('/',offerController.loadAdminOffersPage)
router.get('/category',offerController.loadCategoryOfferPage)
router.get('/product',offerController.loadProductOfferPage)
router.post('/product',offerController.createOfferForProduct)
router.patch('/product/action',offerController.enableDesabelOffer)
router.patch('/product/update',offerController.updateProductOffer)
router.post('/category',offerController.createOfferForCategory)
router.post('/category/action',offerController.enableDesabelOfferForCategoryOffer)
export default router;