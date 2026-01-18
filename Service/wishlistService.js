import wishlistModel from '../Models/wishlistSchema.js'
import mongoose from 'mongoose'

const storeWishlistItemInDB= async (productId,variantId,userId) =>{
 const data =  await  wishlistModel.create({
        productId:productId,
        variantId:variantId,
        userId:userId
    })
}

const getWishlistItems = async(userId) =>{

    const pipeline = []

    pipeline.push( {$match:{userId:new mongoose.Types.ObjectId(userId)}},
    {
        $lookup:{
            from:"products",
            let:{variantId:"$variantId"},
            pipeline:[
                {$unwind:"$variants"},
                {$match:{
                    $expr:{
                        $eq:["$variants._id","$$variantId"]
                    }
                }},
                {$project:{
                    productName:1,
                    generalPhoto:1,
                    categoryId:1,
                    isDeleted:1,
                    discound:1,
                    variants:1
                }}
            ],
            as:"product",
        }
    },
    {$unwind:"$product"},

    {
        $lookup:{
            from:"categories",
            localField:"product.categoryId",
            foreignField:"_id",
            as:"category"
        }
    },
    {$unwind:"$category"})


    // calculate offer 

  // get product offer
   pipeline.push(
    {$lookup:{
      from:'offers',
      let:{'productId':'$product._id'},
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
      let:{'categoryId':'$product.categoryId'},
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
        '$product.discound',
        '$productDiscount',
        '$categoryDiscount'
      ]}
    }},
    {$addFields:{
      finalPrice:{
        $subtract:[
          "$product.variants.price",{$multiply:['$product.variants.price',{$divide:['$finalDiscount',100]}]}
        ]
      }
    }}
  )

   const data =  await wishlistModel.aggregate(pipeline)

   if(data.length > 0){
    return data
   }
   else{
    return false;
   }
}


const remove = async(id)=>{
   await wishlistModel.deleteOne({_id:id});
}

const findWishlist = async (productId,variantId,userId) =>{
  return await wishlistModel.findOne({productId:productId,variantId:variantId,userId:userId})
}

const removeWishlistItem = async(productId,variantId,userId)=>{
  return await wishlistModel.deleteOne({productId,variantId,userId:userId})
}

const addLikeToProduct = async(products,userId)=>{
 
  for(let i = 0; i < products.length; i++){
    let isTrue = await wishlistModel.findOne({productId:products[i]._id,variantId:products[i].variants._id,userId:new mongoose.Types.ObjectId(userId)})
    if(isTrue){
      products[i].like=true;
    }
    else{
      products[i].like=false;
    }
  }
  
  return products;
}

export default {
    storeWishlistItemInDB,
    getWishlistItems,
    remove,
    findWishlist,
    removeWishlistItem,
    addLikeToProduct
}