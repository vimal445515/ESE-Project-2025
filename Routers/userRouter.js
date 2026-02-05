import {Router} from 'express'
import Auth from '../middleware/userAuth.js'
import userControllers from '../Controllers/userControllers/userControllers.js'
import products from "../Controllers/product.js"
import image from "../Config/categoryThumbnail.js"
import walletController from '../Controllers/walletController.js'


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
router.get("/resetPassowrdOtp",Auth.otpCheck,Auth.checkEmail,userControllers.loadOtpPageForResetPassword)
router.post('/otpVerificationResetPassword',Auth.checkEmail,userControllers.resetPasswordOtpVarification)
router.get('/resetPasswordUser',userControllers.loadresetPasswordPage)
router.post('/resetPasswordUser',Auth.checkEmail,userControllers.resetPassword)
router.get('/google/login',userControllers.startGoogleLogin)
router.get('/google/authenticate',userControllers.googleAuthenticate,userControllers.storeUserDataInSession)

router.get("/products",Auth.isUser,Auth.checkUser,products.loadUserSideProductsPage)


router.get("/productDetails/:id",Auth.isUser,Auth.checkUser,products.loadProductDetails)

router.get('/userProfile',Auth.isUser,Auth.checkUser,userControllers.loadUserProfile)

router.get('/EditUser',Auth.isUser,Auth.checkUser,userControllers.editProfile)

router.patch('/Profile/edit',Auth.isUser,Auth.checkUser,image.single('image'),userControllers.sendData)
router.get("/profile/otp",Auth.isUser,Auth.checkUser,userControllers.loadOtpPageForUpdateEmail)
router.get('/profile/resendOtp',Auth.isUser,Auth.checkUser,userControllers.resendOtp)
router.post("/emailUpdateOtpVarification" ,Auth.isUser,userControllers.verifyOptforUpdateEmail)
router.patch("/profile/editPassword",userControllers.userProfileResetPassword)

router.get('/forgotPasswordEmail',(req,res)=>{
    res.render('User/otpEmailPage',{userName:req.session.userName,Profile:req.session.profile,status:null});
})



router.get('/wallet',Auth.isUser,Auth.checkUser,walletController.loadWalletPage)





export default router
