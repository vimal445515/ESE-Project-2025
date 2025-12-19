import {Router} from 'express'
import Auth from '../middleware/userAuth.js'
import userControllers from '../Controllers/userControllers/userControllers.js'
import products from "../Controllers/product.js"


const router = Router()
router.get('/',Auth.isUser,userControllers.loadHomePage)
router.get("/signup",Auth.isLoggedIn,userControllers.loadSignupPage)
router.post('/signup',Auth.isLoggedIn,Auth.checkEmailExists,userControllers.otpGenerator);
router.post('/otpVerification',Auth.checkEmailExists,userControllers.verifyOtp);
router.get('/login',Auth.isLoggedIn,userControllers.loadLoginPage);
router.post('/login',userControllers.authentication);
router.get("/home",Auth.isUser,Auth.checkUser,userControllers.loadHomePage);
router.get("/logout",userControllers.logout);
router.post("/resetPassword",userControllers.findEmail,userControllers.generateOtpForPasswordReset)
router.get("/resetPassowrdOtp",Auth.checkEmail,userControllers.loadOtpPageForResetPassword)
router.post('/otpVerificationResetPassword',Auth.checkEmail,userControllers.resetPasswordOtpVarification)
router.post('/resetPasswordUser',Auth.checkEmail,userControllers.resetPassword)
router.get('/google/login',userControllers.startGoogleLogin)
router.get('/google/authenticate',userControllers.googleAuthenticate,userControllers.storeUserDataInSession)

router.get("/products",Auth.isUser,Auth.checkUser,products.loadUserSideProductsPage)

router.get("/productDetails/:id",Auth.isUser,Auth.checkUser,products.loadProductDetails)
export default router
