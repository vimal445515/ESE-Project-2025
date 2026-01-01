import {Router} from 'express'
import { isLoggedIn,isAdmin,checkEmail} from '../middleware/adminMiddleware.js'
import categoryThumbnail from '../Config/categoryThumbnail.js'
import { loadLoginPage,authentication,loadUserManagementPage,loadCategoriePage,LoadAddCategoriesPage, logout,loadEditCategoriesPage, loadAddProductPage, blockUser, unBlockUser, deleteUser, ActiveUsers,blockedUsers,saveCategoryData ,handleImage,blockCategory,editCategory,handleEditImage} from '../Controllers/admin/controller.js'
import product from '../Controllers/product.js'
import resetPassword from '../Controllers/admin/resetPassword.js'
import adminOrderController from '../Controllers/admin/adminOrderController.js'

const router = Router()

router.get("/login",isLoggedIn,loadLoginPage)
router.post("/login",authentication)
router.get("/home",isAdmin,loadUserManagementPage)
router.get("/user",isAdmin,loadUserManagementPage)
router.get("/categories",isAdmin,loadCategoriePage)

router.post("/resetPassword",resetPassword.findEmail,resetPassword.generateOtpForPasswordReset)
router.get("/resetPassowrdOtp",checkEmail,resetPassword.loadOtpPageForResetPassword)
router.post('/otpVerificationResetPassword',checkEmail,resetPassword.resetPasswordOtpVarification)
router.post('/resetPasswordAdmin',checkEmail,resetPassword.resetPassword)

router.get("/products",isAdmin,product.loadProductsPage)
router.get("/addCategories",isAdmin,LoadAddCategoriesPage)
router.get("/editCategory/:id",isAdmin,loadEditCategoriesPage)
router.get("/addProduct",isAdmin,loadAddProductPage)
router.get("/editProduct/:id",isAdmin,product.loadEditProductPage)

router.post("/user/block/:id",isAdmin,blockUser)
router.post("/user/unBlock/:id",isAdmin,unBlockUser)
router.delete('/user/delete/:id',isAdmin,deleteUser)
router.get('/user/active',isAdmin,ActiveUsers)
router.get('/user/block',isAdmin,blockedUsers)
router.post('/category',isAdmin,handleImage,saveCategoryData)
router.post('/category/block/:id/:isBlocked',isAdmin,blockCategory,loadCategoriePage)
router.post('/category/edit/:id',isAdmin,handleEditImage,editCategory)

router.post('/product/add', isAdmin,categoryThumbnail.any(),product.storeProducts)
router.patch('/product/edit/:id',isAdmin,categoryThumbnail.any(),product.editProduct)
router.delete('/deleteProduct/:id',isAdmin,product.deleteProduct)
router.patch('/unDeleteProduct/:id',isAdmin,product.unDeleteProduct)

router.get('/order',isAdmin,adminOrderController.loadOrderPage)

router.get('/order/edit/:id',isAdmin,adminOrderController.loadEditOrderPage)
router.post('/order/delete',isAdmin,adminOrderController.deleteOrder)
router.patch('/order/edit',isAdmin,adminOrderController.updateOrderStatus)
router.get('/order/reject/:orderId',isAdmin,adminOrderController.rejectReturnOrder)
router.get('/order/accept/:orderId',isAdmin,adminOrderController.updateOrderReturnstatus)

router.get('/order/search',isAdmin,adminOrderController.search)


router.get('/logout',logout)
export default router