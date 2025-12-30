import {Router} from "express" 
import auth from '../middleware/userAuth.js'
import orderController from "../controllers/order.js"
import order from "../controllers/order.js";

const router = Router();

router.get('/',auth.isUser,orderController.loadOrdersHistory)

router.get('/orderDetails/:id',auth.isUser,orderController.loadOrderDetailPage)

router.post('/cancel',auth.isUser,orderController.cancelOrder)
router.post('/',auth.isUser,orderController.placeOrder)

router.get('/return',auth.isUser,orderController.returnOrder)
router.post('/search',auth.isUser,orderController.search)

export default router
