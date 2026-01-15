// import offerService from '../Service/offerService.js'
import offerService from "../Service/offerService.js";
import productService from "../Service/productService.js";
import helpers from '../helpers/helpers.js'
import categoryService from "../Service/categoryService.js";
const loadAdminOffersPage = (req,res)=>{
    res.status(200).render('Admin/offersPage');
}

const loadCategoryOfferPage = async(req,res)=>{
    const categorys = await categoryService.getAllCategoryForOffer();
    const offers = await offerService.getAllOffers('category',0,10);
    res.status(200).render('Admin/categoryOfferPage',{categorys,offers})
}

const loadProductOfferPage = async(req,res)=>{
    const page = req.query?.page||1
    const limit = 10;
    const skip = helpers.paginationSkip(page,limit)
    const  products = await productService.getAllProductsForOffer()
    const offers = await offerService.getAllOffers('product',skip,limit);
    const count = await offerService.getCout('product')
    res.status(200).render('Admin/productOfferPage',{products,offers,count,limit,page});
}

const createOfferForProduct = async(req,res)=>{
    const {offerName,productId,discount,expiryDate} = req.body;
    await offerService.createOffer(offerName,productId,discount,expiryDate);
    req.flash('success','Offer created successfully');
    res.status(200).redirect('/offers/product')
}


const enableDesabelOffer = async(req,res)=>{

    const action = req.body.action ==='true'?true:false;
    if(action){
        await offerService.enableOffer('product',req.body.offerId,req.body.productId)
    }
    else{
        await offerService.desebleOffer(req.body.offerId) 
    }
    res.status(200).json({href:`/offers/product?page=${Number(req.query.page)}`})
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
    const {offerName,categoryId,discount,expiryDate} = req.body;
    await offerService.createCategoryOffer(offerName,categoryId,discount,expiryDate)
    res.status(201).redirect('/offers/category');
}


export default 
{
    loadAdminOffersPage,
    loadCategoryOfferPage,
    loadProductOfferPage,
    createOfferForProduct,
    enableDesabelOffer,
    updateProductOffer,
    createOfferForCategory
}