import { Router } from "express";

const router = Router();

router.get('/',(req,res)=>{
    res.status(200).render('Admin/offersPage');
})
router.get('/category',(req,res)=>{
    res.status(200).render('Admin/categoryOfferPage')
})

router.get('/product',(req,res)=>{
    res.status(200).render('Admin/productOfferPage');
})

router.get('/referral',(req,res)=>{
    res.status(200).render('Admin/referralOfferPage');
})

export default router;