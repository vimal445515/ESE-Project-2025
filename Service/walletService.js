import { walletModel,walletTransaction } from "../Models/walletSchema.js";
import mongoose from 'mongoose'

const createWallet = async(userId) =>{
    await walletModel.create({
        userId:new mongoose.Types.ObjectId(userId)
    })
}

const getWallet = async(userId)=>{
    
   const  walletData =  await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)})
    const walletTransactionData = await walletTransaction.find({userId:new mongoose.Types.ObjectId(userId)})
    return {walletData,walletTransactionData};
}

export default{
    createWallet,
    getWallet
}