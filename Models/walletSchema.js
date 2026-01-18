import mongoose from 'mongoose'
import { useId } from 'react'

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
    useId:{
         required:true,
        type:mongoose.Types.ObjectId
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
    }
},{timeseries:true})

export const walletModel = mongoose.Model('wallet',walletSchema)
export const walletTransaction = mongoose.Model('walletTransaction',walletTransactionSchema)