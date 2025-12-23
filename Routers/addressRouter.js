import {Router} from "express"
import addressController from '../Controllers/address.js'
import auth from '../middleware/userAuth.js'
const router = Router();

router.get('/',auth.isUser,auth.checkUser,addressController.loadAddressPage)
router.post('/',auth.isUser,auth.checkUser,addressController.address) 

export default router;