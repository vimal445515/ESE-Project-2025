import productService from '../Service/productService.js'
import productHelper from '../helpers/productHelper.js'
import helpers from '../helpers/helpers.js'
import adminService from '../Service/adminService.js'
const storeProducts = async (req,res)=>{
    const {productName,basePrice,description,category,discound} = req.body
    const generalPhoto = productHelper.extractGeneralImage(req.files)
    const VariantsData = productHelper.structureProductData(req.files,req.body)
    const data = await productService.storeProductDataInDB(generalPhoto,productName,basePrice,description,category,discound,VariantsData)
   return res.status(201).json("product added Successfully"); 
    
}
 const loadProductsPage = async(req,res)=>{
    const page = req.query.page||1
    const search = req.query.search
    const limit = 8;
    const skip = helpers.paginationSkip(page,limit)
    const products = await productService.getAllProducts(skip,limit,search);
    const count = await productService.getAllProductsCount();
    res.render('Admin/product',{products,page,limit,count})
}


 const loadEditProductPage = async (req,res)=>{
   const id =  req.params.id
    const product =  await productService.getProduct(id)
    const productCategory = await productService.getCategory(product.categoryId);
    const categories = await adminService.getCategories()
    res.render("Admin/editProduct",{product,categories,productCategory})
}
const editProduct = async  (req,res) =>{
     let  data = await productService.getProduct(req.params.id);
    
        let  productName = req.body.productName||data.productName;
        let  basePrice = req.body.basePrice||data.basePrice;
        let  description = req.body.description||data.description;
        let  category = req.body.category||data.categoryId;
        let  discound = req.body.discound|data.discound;
    
     let variantsData = productHelper.structureProductData(req.files,req.body)
     let generalPhoto = productHelper.extractGeneralImage(req?.files)
       

    

    
     generalPhoto = generalPhoto||data.generalPhoto;
    
     variantsData[0].price = variantsData[0]?.price||data.variants[0].price
     variantsData[0].stock = variantsData[0]?.stock||data.variants[0].stock
     variantsData[0].storage= variantsData[0]?.storage||data.variants[0].storage
     variantsData[0].ram = variantsData[0].ram||data.variants[0].ram
    
     variantsData[0].images[0] = variantsData[0]?.images[0]||data.variants[0].images[0]
     variantsData[0].images[1] = variantsData[0]?.images[1]||data.variants[0].images[1]
     variantsData[0].images[2] = variantsData[0]?.images[2]||data.variants[0].images[2]
     variantsData[0].images[3] = variantsData[0]?.images[3]||data.variants[0].images[3]

     productHelper.deleteExeistingImage(generalPhoto,variantsData[0]?.images[0],variantsData[0]?.images[1],variantsData[0]?.images[2],variantsData[0]?.images[3],data);
    
    data = await productService.editProductInDB(productName,basePrice,description,category,discound,generalPhoto,variantsData,req.params.id)
    console.log(data.variants[0].images[0]);
    const productCategory = await productService.getCategory(category);
    const categories = await adminService.getCategories()
    res.status(200).json({_id:data._id})
}


const deleteProduct = async (req,res)=>{
    await productService.deleteProductFromDB(req.params.id)
    res.status(200).json("deleted succusfully");
}

const loadUserSideProductsPage = async(req,res)=>{
    const page = req.query.page||1
    const sort = req.query.sort
    const category = req.query.category;
    const priceRange = req.query.priceRange;
    const searchValue = req.query.search;
    
    const limit = 16;
    const skip = helpers.paginationSkip(page,limit)
    const products = await productService.getAllProductsUserSide (skip,limit,sort,category,priceRange,searchValue);
    const toatalCount = await productService.countPages()
    const {count} =toatalCount[0]
    
    res.render('User/products',{products,userName:req.session.userName,page,limit,count,sort,searchValue,category,priceRange})
}

 const loadProductDetails = async (req, res) => {
  const id = req.params.id;
  const storage = req.query.rom;
  const ram = req.query.ram;

  const productArray = await productService.getSingleProduct(id, storage, ram);
  const getVariants = await productService.getVariants(id);

  let productData;

  if (!productArray || productArray.length === 0) {
    const fallback = await productService.getSingleProduct(id);


    productData = fallback[0];
  } else {
    productData = productArray[0];
  }

  const relateditems = await productService.getRelateditems(productData.categoryId);

  res.render("User/singleProductPage", {
    userName: req.session.userName,
    productData,
    getVariants,
    relateditems,
    ram,
    storage
  });
};



export default {
    storeProducts,
    loadProductsPage,
    loadEditProductPage,
    editProduct,
    deleteProduct,
    loadUserSideProductsPage,
    loadProductDetails
}