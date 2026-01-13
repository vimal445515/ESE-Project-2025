import {Router} from 'express'
import { isAdmin} from '../middleware/adminMiddleware.js'
import auth from '../middleware/userAuth.js'
import couponController from '../Controllers/couponController.js';
const router = Router();

router.get('/coupon',isAdmin,couponController.loadCouponPage)
router.post('/coupon',isAdmin,couponController.createCoupon)
router.patch('/coupon/activate',isAdmin,couponController.activateCoupon)
router.patch('/coupon/deactive',isAdmin,couponController.deactiveCoupon)
router.post('/coupon/edit',isAdmin,couponController.editCoupon)
router.post('/checkout/coupon',auth.isUser,couponController.applayCoupon)
router.post('/checkout/removeCoupon',auth.isUser,couponController.removeCoupon)

export default router