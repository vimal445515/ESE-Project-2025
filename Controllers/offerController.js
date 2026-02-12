// import offerService from '../Service/offerService.js'
import offerService from "../Service/offerService.js";
import productService from "../Service/productService.js";
import helpers from '../helpers/helpers.js'
import categoryService from "../Service/categoryService.js";
const loadAdminOffersPage = (req,res)=>{
    res.status(200).render('Admin/offersPage');
}

const loadCategoryOfferPage = async(req,res)=>{
    const page = req.query?.page||1
    const limit = 10;
    try{
    const skip = helpers.paginationSkip(page,limit)
    const categorys = await categoryService.getAllCategoryForOffer();
    const offers = await offerService.getAllOffers('category',skip,limit);
     const count = await offerService.getCout('category')
    res.status(200).render('Admin/categoryOfferPage',{categorys,offers,count,limit,page})
    }catch(error){
        console.log(error)
        res.status(500).redirect('/500Error');
    }
}

const loadProductOfferPage = async(req,res)=>{
    const page = req.query?.page||1
    const limit = 10;
    try{
    const skip = helpers.paginationSkip(page,limit)
    const  products = await productService.getAllProductsForOffer()
    const offers = await offerService.getAllOffers('product',skip,limit);
    const count = await offerService.getCout('product')
    res.status(200).render('Admin/productOfferPage',{products,offers,count,limit,page});
    }catch(error){
        console.log(error)
        res.status(500).redirect('/500Error')
    }
}

const createOfferForProduct = async(req,res)=>{
    try{
    const {offerName,productId,discount,expiryDate} = req.body;
    await offerService.createOffer(offerName,productId,discount,expiryDate);
    req.flash('success','Offer created successfully');
    res.status(200).redirect('/offers/product')
    }catch(error){
        console.log(error)
        res.status(500).redirect('/500Error');
    }
}


const enableDisableOffer = async(req,res)=>{
 try{
   
    const action = req.body.action ==='true'?true:false;
    if(action){
        await offerService.enableOffer('product',req.body.offerId,req.body.productId)
    }
    else{
        await offerService.desebleOffer(req.body.offerId) 
    }
    res.status(200).json({href:`/offers/product?page=${Number(req.query.page)}`})
    }catch(error){
        console.log(error);
        res.status(500).json({type:"error",message:"internal server error"})
    }
}

const updateProductOffer = async (req,res)=>{
    try{
            const {offerName,discount,expiryDate,offerId} = req.body;
             await offerService.updateOffer(offerName,discount,expiryDate,offerId)
             req.flash('success','offer updated successfully');
             res.status(200).json({type:"success",message:"Offer updated successfully"})
    }
    catch(error){
        req.flash('error','Oops somthing was Wrong')
        res.status(500).json({type:"error",message:"! Oops somthing was Wrong"});
    }
}


const createOfferForCategory = async(req,res)=>{
    try{
    const {offerName,categoryId,discount,expiryDate} = req.body;
    await offerService.createCategoryOffer(offerName,categoryId,discount,expiryDate)
    res.status(201).redirect('/offers/category');
    }catch(error){
        res.status(500).redirect('/500Error');
    }
}


const enableDisableOfferForCategoryOffer = async(req,res)=>{
    try{
    const action = req.body.action ==='true'?true:false;
    if(action){
        await offerService.enableOffer('category',req.body.offerId,req.body.categoryId)
    }
    else{
        await offerService.desebleOffer(req.body.offerId) 
    }
    res.status(200).json({href:`/offers/category?page=${Number(req.query.page)}`})
    }catch(error){
         console.log(error);
        res.status(500).json({type:"error",message:"internal server error"})
    }
}


const updateCategoryOffer = async (req,res)=>{
    try{
            const {offerName,discount,expiryDate,offerId} = req.body;
             await offerService.updateOffer(offerName,discount,expiryDate,offerId)
             req.flash('success','offer updated successfully');
             res.status(200).json({type:"success",message:"Offer updated successfully"})
    }
    catch(error){
        req.flash('error','Oops somthing was Wrong')
        res.status(500).json({type:"error",message:"! Oops somthing was Wrong"});
    }
}


export default 
{
    loadAdminOffersPage,
    loadCategoryOfferPage,
    loadProductOfferPage,
    createOfferForProduct,
    enableDisableOffer,
    updateProductOffer,
    createOfferForCategory,
    enableDisableOfferForCategoryOffer,
    updateCategoryOffer
}