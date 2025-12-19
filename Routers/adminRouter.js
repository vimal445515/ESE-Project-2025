import {Router} from 'express'
import { isLoggedIn,isAdmin,checkEmail} from '../middleware/adminMiddleware.js'
import categoryThumbnail from '../Config/categoryThumbnail.js'
import { loadLoginPage,authentication,loadUserManagementPage,loadCategoriePage,LoadAddCategoriesPage, logout,loadEditCategoriesPage, loadAddProductPage, blockUser, unBlockUser, deleteUser, ActiveUsers,blockedUsers,saveCategoryData ,handleImage,blockCategory,editCategory,handleEditImage} from '../Controllers/admin/controller.js'
import product from '../Controllers/product.js'
import resetPassword from '../Controllers/admin/resetPassword.js'

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

router.post("/user/block/:id",blockUser)
router.post("/user/unBlock/:id",unBlockUser)
router.delete('/user/delete/:id',deleteUser)
router.get('/user/active',ActiveUsers)
router.get('/user/block',blockedUsers)
router.post('/category',handleImage,saveCategoryData)
router.post('/category/block/:id/:isBlocked',blockCategory,loadCategoriePage)
router.post('/category/edit/:id',handleEditImage,editCategory)

router.post('/product/add', categoryThumbnail.any(),product.storeProducts)
router.patch('/product/edit/:id',categoryThumbnail.any(),product.editProduct)
router.delete('/deleteProduct/:id',product.deleteProduct)

router.get('/logout',logout)
export default router