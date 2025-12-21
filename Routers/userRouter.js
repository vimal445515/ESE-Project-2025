import {Router} from 'express'
import Auth from '../middleware/userAuth.js'
import userControllers from '../Controllers/userControllers/userControllers.js'
import products from "../Controllers/product.js"
import image from "../Config/categoryThumbnail.js"
import userService from '../Service/userService.js'


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

router.get('/userProfile',Auth.isUser,Auth.checkUser,userControllers.loadUserProfile)

router.get('/EditUser',Auth.isUser,Auth.checkUser,userControllers.editProfile)

router.patch('/Profile/edit',Auth.isUser,Auth.checkUser,image.single('image'),userControllers.sendData)
router.get("/profile/otp",Auth.isUser,Auth.checkUser,userControllers.loadOtpPageForUpdateEmail)
router.post("/emailUpdateOtpVarification" ,Auth.isUser,Auth.checkUser,userControllers.verifyOptforUpdateEmail)

router.get('/orders',Auth.isUser,Auth.checkUser,(req,res)=>{
    res.render('User/orders',{userName:req.session.userName})
})

router.get('/wallet',Auth.isUser,Auth.checkUser,(req,res)=>{
    res.render('User/wallet',{userName:req.session.userName})
})

router.get('/address',(req,res)=>{
    res.render('User/address',{userName:req.session.userName})
})

router.get('/wishlist',(req,res)=>{
    res.render('User/wishlist',{userName:req.session.userName})
})
export default router
