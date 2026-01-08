import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    thumbnail:{
        type:Object
    },
    createdAt:{
        type:Date
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})
export const categoryModel = mongoose.model("category",CategorySchema);