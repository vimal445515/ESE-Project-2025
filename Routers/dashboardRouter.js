import {Router} from "express"
import adminDashBoardController from "../Controllers/adminDashBoardController.js"
import { isAdmin } from "../middleware/adminMiddleware.js"

const router = Router()

router.get('/admin/dashboard',isAdmin,adminDashBoardController.loadAdminDashboard)

export default router