import {Router} from "express"
import checkoutController from '../Controllers/checkout.js'
import auth from '../middleware/userAuth.js'
const router = Router()

router.route('/checkout')
.get(auth.isUser,checkoutController.loadCheckOutPage)


router.post('/checkout/address',auth.isUser,checkoutController.displayAddress)
export default router