import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
    price:{
        type:Number,
        require:true
    },
    stock:{
        type:Number,
        require:true
    },
    storage:{
        type:Number,
        require:false
    },
    ram:{
        type:Number,
        require:false
    },
    images:[{type:String}]
})


const productSchema = new mongoose.Schema({
   productName:{
    type:String,
    require:true
   },
   basePrice:{
    type:Number,
    require:true
   },
   description:{
    type:String
   },
   categoryId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'category'
   },
   createdAt:{
    type:Date,
    default:new Date()
   },
   discound:{
    type:Number
   },
   generalPhoto:{
    type:String
   },
   isDeleted:{
    type:Boolean,
    default:false
   },
   variants:[variantSchema]
})

export const productModel = mongoose.model('product',productSchema)