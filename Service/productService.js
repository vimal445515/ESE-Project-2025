import { categoryModel } from "../Models/categorySchema.js";
import { productModel } from "../Models/productSchema.js";
import mongoose from "mongoose"
import offerService from "./offerService.js";
import offerModel from "../Models/offerSchema.js";
import productHelpers from '../helpers/productHelper.js'
import cloudinary from '../config/cloudinary.js'
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

const storeVariant = async(images,data)=>{
    await productModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(data.productId)},{$push:{variants:{...data,images}}})
}

const deleteVariantImages = async(images)=>{
  if(images[0]?.filename) await  cloudinary.uploader.destroy(images[0].filename);
    if(images[0]?.filename)await  cloudinary.uploader.destroy(images[0].filename);
      if(images[0]?.filename)  await  cloudinary.uploader.destroy(images[0].filename);
        if(images[0]?.filename) await  cloudinary.uploader.destroy(images[0].filename);
 
    
  
   
}

const getProduct = async (_id,index) =>{
  console.log("this is wrking")
 const oldData = await productModel.findOne({_id});
 const data = await productModel.aggregate([
    {$match:{_id:new mongoose.Types.ObjectId(_id)}},
    {$unwind:'$variants'},
    {$skip:index},
    {$limit:1}
  ])
  
  console.log(data[0],"and ",oldData)
  return data[0]
 
}


const removeVariant = async (_id,index)=>{
  const product = await productModel.findOne({_id})
  if(product.variants.length > 1){
     await productHelpers.deleteExeistingImage(null,product.variants[index].images[0],product.variants[index].images[1],product.variants[index].images[2],product.variants[index].images[3])
     await productModel.updateOne({_id},{$unset:{[`variants.${index}`]:1}})
     await productModel.updateOne({_id},{$pull:{variants:null}});
     return true
  }else{
    return false
  } 
}

const variantCount = async (productId)=>{
 const value =  await productModel.aggregate([
    {$match:{_id:new mongoose.Types.ObjectId(productId)}},
    {$project:{'variants':1,'_id':0}}
  ])
  
  return value[0]
}

const getCategory = async(_id) =>{
  return await categoryModel.findOne({_id})
}

const editProductInDB = async(productName,basePrice,description,category,discound,generalPhoto,variantsData,_id,index)=>
{ const variantId = await productModel.find({_id})
    await productModel.findOneAndUpdate({_id},{$set:{productName,basePrice,description,categoryId:category,discound,generalPhoto,
      
      'variants.$[variant].price':variantsData.price,
      'variants.$[variant].stock':variantsData.stock,
      'variants.$[variant].storage':variantsData.storage,
      'variants.$[variant].ram':variantsData.ram,
      'variants.$[variant].images':variantsData.images

    }},{arrayFilters:[{'variant._id':variantId[0].variants[Number(index)]._id}]})
   const data =  await productModel.findOne({_id})
   return data
}

const deleteProductFromDB = async(_id)=>{
  return await productModel.findOneAndUpdate({_id},{$set:{isDeleted:true}})
}

const unDeleteProductFromDB = async(_id)=>{
  console.log("unDeleteProduct",_id)
  return await productModel.findOneAndUpdate({_id},{$set:{isDeleted:false}})
}

const getAllProductsCount = async ()=>{
  return await productModel.countDocuments({isDeleted:false});
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
  },
  {$unwind:'$variants'}
  ,{$sort:{'createdAt':-1}},{
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
  }
  )

  // calculate offer 

  // get product offer
  pipeline.push(
    {$lookup:{
      from:'offers',
      let:{'productId':'$_id'},
      pipeline:[
       {
         $match:{
          $expr:{
            $and:[
              {$eq:['$targetId','$$productId']},
              {$eq:['$isActive',true]},
              {$gte:['$expiryDate',new Date()]} 
            ]
          }
        }
       }
      ]

      ,as:"productOffer"
    }
  
  }
  )

 // get category offer
  pipeline.push({
    $lookup:{
      from:"offers",
      let:{'categoryId':'$categoryId'},
      pipeline:[
        {$match:{
         $expr:{
          $and:[
            {$eq:['$targetId','$$categoryId']},
            {$eq:['$isActive',true]},
            {$gte:['$expiryDate',new Date()]}
          ]
         }
        }}
      ],
      as:"categoryOffer"
    }
  })


  pipeline.push({
    $addFields:{
      productDiscount:{
        $ifNull:[{$arrayElemAt:['$productOffer.discount',0]},0]
      },
      categoryDiscount:{
        $ifNull:[{$arrayElemAt:['$categoryOffer.discount',0]},0]
      }
    }
  })

  // get final discount

  pipeline.push(
    {$addFields:{
     finalDiscount:{$max:[
        '$discound',
        '$productDiscount',
        '$categoryDiscount'
      ]}
    }},
    {$addFields:{
      finalPrice:{
        $subtract:[
          "$variants.price",{$multiply:['$variants.price',{$divide:['$finalDiscount',100]}]}
        ]
      }
    }}
  )

  
  if(sort){
    if(sort ==='ltoH'){
      pipeline.push({$sort:{finalPrice:1}})
    }
    else if(sort ==='htoL'){
      pipeline.push({$sort:{finalPrice:-1}})
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
      pipeline.push({$match:{finalPrice:{$lte:10000}}})
    }
    else if(priceRange ==="price20k30k"){
      pipeline.push({$match:{$and:[{finalPrice:{$gte:20000}},{finalPrice:{$lte:30000}}]}})
    }
    else if(priceRange ==="priceOver50k"){
      pipeline.push({$match:{finalPrice:{$gte:5000}}})
    }
    
  }

   if(category && category !== "all" ){
      pipeline.push({$match:{'category.categoryName':category}})
  }

  if(searchValue){
   
    pipeline.push({$match:{productName:{$regex:searchValue,$options:"i"}}});
  }

if( limit){
    pipeline.push({$skip:skip},
  {$limit:limit})
}
   
  const products =  await productModel.aggregate(pipeline)
  return products
  
}

const getSingleProduct= async (_id,storage,ram,variantId) =>{
  let pipeline =[]
  pipeline.push(
       {$match:{_id:new mongoose.Types.ObjectId(_id)}},
      //  {$match:{isDeleted:false}},
      {$lookup:{
        from:"categories",
        localField:"categoryId",
        foreignField:"_id",
        as:"category"
      }},
      {$unwind:'$variants'}      
    )
if(variantId){
  pipeline.push({
    $match:{'variants._id':new mongoose.Types.ObjectId(variantId)}
  })
}
    // calculate offer 

  // get product offer
   pipeline.push(
    {$lookup:{
      from:'offers',
      let:{'productId':'$_id'},
      pipeline:[
       {
         $match:{
          $expr:{
            $and:[
              {$eq:['$targetId','$$productId']},
              {$eq:['$isActive',true]},
              {$gte:['$expiryDate',new Date()]} 
            ]
          }
        }
       }
      ]

      ,as:"productOffer"
    }
  
  }
  )

 // get category offer
  pipeline.push({
    $lookup:{
      from:"offers",
      let:{'categoryId':'$categoryId'},
      pipeline:[
        {$match:{
         $expr:{
          $and:[
            {$eq:['$targetId','$$categoryId']},
            {$eq:['$isActive',true]},
            {$gte:['$expiryDate',new Date()]}
          ]
         }
        }}
      ],
      as:"categoryOffer"
    }
  })


  pipeline.push({
    $addFields:{
      productDiscount:{
        $ifNull:[{$arrayElemAt:['$productOffer.discount',0]},0]
      },
      categoryDiscount:{
        $ifNull:[{$arrayElemAt:['$categoryOffer.discount',0]},0]
      }
    }
  })

  // get final discount

  pipeline.push(
    {$addFields:{
     finalDiscount:{$max:[
        '$discound',
        '$productDiscount',
        '$categoryDiscount'
      ]}
    }},
    {$addFields:{
      finalPrice:{
        $subtract:[
          "$variants.price",{$multiply:['$variants.price',{$divide:['$finalDiscount',100]}]}
        ]
      }
    }}
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
    
  ])
}

const getRelateditems = async (_id)=>{
  return await productModel.find({categoryId:_id,isDeleted:false}).limit(10);
}


const isBlocked = async(productId)=>{
  return await productModel.find({_id:productId,isDeleted:false})
}

const getAllProductsForOffer=async()=>{
  return await productModel.find({isDeleted:false},{productName:1})
}
const getSingleProductName = async(productId)=>{
 const product = await productModel.findOne({_id:productId});
 return product.productName;
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
 unDeleteProductFromDB,
 variantCount,
 getAllProductsForOffer,
 getSingleProductName,
removeVariant ,
storeVariant,
deleteVariantImages


}
