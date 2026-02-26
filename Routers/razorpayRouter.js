import {Router} from 'express'
import razorpayController from '../Controllers/razorpayController.js'

const router = Router()

router.post('/createOrder',razorpayController.createOrderForRazorpay);


router.post('/varifyPayment',razorpayController.varifyPaymentRazorpay);

router.post('/paymentFaild',razorpayController.razorpayPaymentFaild);

router.post('/oldOrderId',razorpayController.retryPayment);

export default router