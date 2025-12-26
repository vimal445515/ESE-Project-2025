import {Router} from "express" 
import auth from '../middleware/userAuth.js'
import orderController from "../controllers/order.js"

const router = Router();

router.get('/',auth.isUser,orderController.loadOrdersHistory)

router.get('/orderDetails/:id',orderController.loadOrderDetailPage)

router.get('/cancel',orderController.loadOrderCancelPage)

router.post('/',auth.isUser,orderController.placeOrder)

export default router
