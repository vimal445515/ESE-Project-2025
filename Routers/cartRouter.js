import {Router} from 'express'
import cartController from '../Controllers/cart.js'
import auth from '../middleware/userAuth.js'
import cartSchema from '../Models/cartSchema.js';

const router = Router();

router.route("/cart")
.get(auth.isUser,cartController.leadCartPage)
.post(auth.isUser,cartController.addToCart)
.delete(auth.isUser,cartController.deleteCartItem)
router.get('/deleteCartItems', async(req,res)=>{
   await cartSchema.deleteMany({userId:req.session._id})
   res.redirect('/cart')
})
export default router