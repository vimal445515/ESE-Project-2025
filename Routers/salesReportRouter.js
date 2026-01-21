import {Router} from 'express'
import {isAdmin} from '../middleware/adminMiddleware.js'
import salesReportControllers from '../Controllers/salesReportControllers.js'

const router = Router()

router.get('/reports',isAdmin,salesReportControllers.loadSalesReportPage)
export default router