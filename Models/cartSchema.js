import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    productId:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    variantId:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    quantity:{
        type:Number
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

export default mongoose.model('cartItem',cartSchema);

