import {Router} from "express"
import addressController from '../Controllers/address.js'
import auth from '../middleware/userAuth.js'
const router = Router();

router.get('/',auth.isUser,auth.checkUser,addressController.loadAddressPage)
router.get('/:id',auth.isUser,addressController.loadSelectedAddress)
router.post('/',auth.isUser,auth.checkUser,addressController.address) 
router.delete("/",auth.isUser,auth.checkUser,addressController.deleteAddress)

export default router;