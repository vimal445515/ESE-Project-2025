import mongoose from 'mongoose'

const walletSchema = new mongoose.Schema({
    userId:{
        required:true,
        type:mongoose.Types.ObjectId
    },
    balance:{
        type:Number,
        require:true,
        default:0
    }
},{timeseries:true})

const walletTransactionSchema = new mongoose.Schema({
    userId:{
         required:true,
        type:mongoose.Types.ObjectId
    },
    transactionId:{
          type:String,
        required:true
    },
    amount:{
        required:true,
        type:Number
    },
    type:{
        type:String,
        required:true
    },
    orderId:{
        type:String
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

export const walletModel = mongoose.model('wallet',walletSchema)
export const walletTransaction = mongoose.model('walletTransaction',walletTransactionSchema)