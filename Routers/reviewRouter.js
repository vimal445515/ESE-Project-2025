import {Router} from 'express'
import auth from '../middleware/userAuth.js'
import reviewControllers from '../Controllers/reviewControllers.js'


const router = Router()

router.post('/review',auth.isUser,reviewControllers.storeReview)

export default router
