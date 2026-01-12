import {Router} from 'express'
import { isAdmin} from '../middleware/adminMiddleware.js'
import couponController from '../Controllers/couponController.js';
const router = Router();

router.get('/coupon',couponController.loadCouponPage)
router.post('/coupon',couponController.createCoupon)
router.patch('/coupon/activate',couponController.activateCoupon)
router.patch('/coupon/deactive',couponController.deactiveCoupon)
export default router