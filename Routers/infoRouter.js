import { profile } from "console";
import {Router} from "express"

const router = new Router();

router.get('/about',(req,res)=>{
    res.status(200).render('User/aboutPage',{userName:req.session?.userName||null,profile:req.session?.profile||null});
})
router.get('/404Page',(req,res)=>{
    res.status(404).render('User/404Page',{userName:req.session?.userName||null,profile:req.session?.profile||null})
})

router.get('/contact',(req,res)=>{
    res.status(200).render('User/contactPage',{userName:req.session?.userName||null,profile:req.session?.profile||null})
})
export default router