import {Router} from 'express'
import cartController from '../Controllers/cart.js'
import auth from '../middleware/userAuth.js'

const router = Router();

router.route("/cart")
.get(auth.isUser,cartController.leadCartPage)
.post(auth.isUser,cartController.addToCart)
.delete(auth.isUser,cartController.deleteCartItem)

export default router