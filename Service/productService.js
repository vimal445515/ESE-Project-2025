import { categoryModel } from "../Models/categorySchema.js";
import { productModel } from "../Models/productSchema.js";
import mongoose from "mongoose"

const storeProductDataInDB = async (generalPhoto,productName,basePrice,description,category,discound,variantsData)=>{
  
  return await productModel.create({
        generalPhoto,
        productName,
        basePrice,
        description,
        categoryId:category,
        discound,
        variants:variantsData
    })
}

const getAllProducts = async (skip,limit,search) =>{
  let pipeline =[]
 if(search) pipeline.push({$match:{productName:{$regex:search,$options:"i"}}});
  pipeline.push(
  {
    $lookup:{
      from:"categories",
      foreignField:"_id",
      localField:"categoryId",
      as:"category"
    }
  },{$sort:{'createdAt':-1}},
  {$match:{'category.isBlocked':false}},
  {
    $addFields:{totalStock:{$sum:"$variants.stock"}}
  },
  {$skip:skip},
  {$limit:limit},
  
)
  return await productModel.aggregate(pipeline)
}

const countPages = async () =>{
  return await productModel.aggregate([{
    $match:{isDeleted:false}
  },{
    $lookup:{
      from:"categories",
      foreignField:"_id",
      localField:"categoryId",
      as:"category"
    }
  },{
    $addFields:{totalStock:{$sum:"$variants.stock"}}
  },
  {$count:"count"}
])
}


const getProduct = async (_id) =>{
  return await productModel.findOne({_id});
}
const getCategory = async(_id) =>{
  return await categoryModel.findOne({_id})
}

const editProductInDB = async(productName,basePrice,description,category,discound,generalPhoto,variantsData,_id)=>
{ 
  return await productModel.findOneAndUpdate({_id},{$set:{productName,basePrice,description,categoryId:category,discound,generalPhoto,'variants.0':variantsData}})    
}

const deleteProductFromDB = async(_id)=>{
  return await productModel.findOneAndUpdate({_id},{$set:{isDeleted:true}})
}

const unDeleteProductFromDB = async(_id)=>{
  console.log("unDeleteProduct",_id)
  return await productModel.findOneAndUpdate({_id},{$set:{isDeleted:false}})
}

const getAllProductsCount = async ()=>{
  return await productModel.countDocuments();
}

const getWatches = async ()=>{
  return await productModel.aggregate([
    {$match:{isDeleted:false}},
    {$lookup:{
      from:'categories',
      foreignField:"_id",
      localField:"categoryId",
      as:"categories"
    }},
    {$unwind:"$categories"},
    {$match:{'categories.categoryName':'watch'}},
    {$unwind:"$variants"},
    {$limit:10}
  ])
}

const getNewProducts= async ()=>{
  return await productModel.find({isDeleted:false}).sort({createdAt:-1}).limit(10)
}



const getAllProductsUserSide = async (skip,limit,sort,category,priceRange,searchValue) =>{
  let pipeline = []
  pipeline.push({
    $match:{isDeleted:false}
  },{$sort:{'createdAt':-1}},{
    $lookup:{
      from:"categories",
      foreignField:"_id",
      localField:"categoryId",
      as:"category"
    }
  },
  {$match:{'category.isBlocked':false}}
  ,{
    $addFields:{totalStock:{$sum:"$variants.stock"}}
  },
  {$skip:skip},
  {$limit:limit})
  
  if(sort){
    if(sort ==='ltoH'){
      pipeline.push({$sort:{basePrice:1}})
    }
    else if(sort ==='htoL'){
      pipeline.push({$sort:{basePrice:-1}})
    }else if(sort ==='AZ'){
      pipeline.push({$addFields:{lowerCase:{$toLower:"$productName"}}},{$sort:{lowerCase:1}})
    }
    else if(sort ==='ZA'){
      pipeline.push({$addFields:{lowerCase:{$toLower:"$productName"}}},{$sort:{lowerCase:-1}})
    }
  }

 
 
  if(priceRange){
    
    if(priceRange==="priceUnder10k")
    {
      pipeline.push({$match:{basePrice:{$lte:10000}}})
    }
    else if(priceRange ==="price20k30k"){
      pipeline.push({$match:{$and:[{basePrice:{$gte:20000}},{basePrice:{$lte:30000}}]}})
    }
    else if(priceRange ==="priceOver50k"){
      pipeline.push({$match:{basePrice:{$gte:5000}}})
    }
    
  }

   if(category && category !== "all" ){
      pipeline.push({$match:{'category.categoryName':category}})
  }

  if(searchValue){
   
    pipeline.push({$match:{productName:{$regex:searchValue,$options:"i"}}});
  }
   
  return await productModel.aggregate(pipeline)
}

const getSingleProduct= async (_id,storage,ram) =>{
  let pipeline =[]
  pipeline.push(
       {$match:{_id:new mongoose.Types.ObjectId(_id)}},
       {$match:{isDeleted:false}},
      {$lookup:{
        from:"categories",
        localField:"categoryId",
        foreignField:"_id",
        as:"category"
      }},
      {$match:{"category.isBlocked":false}},
      {$unwind:'$variants'}      
    )
    if (storage !== undefined ) {
    pipeline.push({
      $match: { "variants.storage": Number(storage) }
    });
  }

  if (ram !== undefined ) {
    pipeline.push({
      $match: { "variants.ram": Number(ram) }
    });

    
}

pipeline.push({$limit:1});


    return await productModel.aggregate(pipeline)
}

const getVariants = async(_id)=>{
  return await productModel.aggregate([
    {$match:{_id:new mongoose.Types.ObjectId(_id)}},
    {$project:{storage:'$variants.storage',ram:"$variants.ram"}}
  ])
}

const getRelateditems = async (_id)=>{
  return await productModel.find({categoryId:_id,isDeleted:false}).limit(10);
}


const isBlocked = async(productId)=>{
  return await productModel.find({_id:productId,isDeleted:false})
}



export default {
 storeProductDataInDB,
 getAllProducts,
 getProduct,
 getCategory,editProductInDB,
 deleteProductFromDB,
 getAllProductsCount,
 getNewProducts,
 getWatches,
 getAllProductsUserSide,
 countPages,
 getSingleProduct,
 getVariants,
 getRelateditems,
 isBlocked,
 unDeleteProductFromDB


}
