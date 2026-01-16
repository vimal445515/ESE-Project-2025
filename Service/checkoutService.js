import {productModel} from '../Models/productSchema.js'
import mongoose from 'mongoose'

const getProduct = async(productId,variantId)=>{
   const pipeline = []
    pipeline.push({$match:{_id:new mongoose.Types.ObjectId(productId)}},
        {$unwind:'$variants'},
        {$match:{"variants._id":new mongoose.Types.ObjectId(variantId)}})

    pipeline.push({
        $project:{
            _id:0,
            product:{
                _id:'$_id',
                productName:"$productName",
                basePrice:"$basePrice",
                discription:"$description",
                discound:'$discound',
                categoryId:"$categoryId",
                createdAt:"$createdAt",
                generalPhoto:"$generalPhoto",
                isDeleted:"$isDeleted",
                variants:'$variants'

            }
        }
    })
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

  const data =await  productModel.aggregate(pipeline);
    console.log(data)
   return data;
}

export default {
    getProduct
}