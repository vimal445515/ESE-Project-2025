import { walletModel,walletTransaction } from "../Models/walletSchema.js";
import mongoose from 'mongoose'
import helpers from "../helpers/helpers.js";
const createWallet = async(userId) =>{
    await walletModel.create({
        userId:new mongoose.Types.ObjectId(userId)
    })
}

const getWallet = async(userId)=>{
    
   const  walletData =  await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)})
    const walletTransactionData = await walletTransaction.find({userId:new mongoose.Types.ObjectId(userId)}).sort({createdAt:-1})
    return {walletData,walletTransactionData};
}


const craditWallet = async(orderId,userId,amount) =>{
  const  wallet = await walletModel.findOne({userId:new mongoose.Types.ObjectId(userId)})
  console.log(wallet)
  wallet.balance +=amount;
  await wallet.save()
  const transactionId = helpers.generateTransactionId()
    await walletTransaction.create({
        transactionId:transactionId,
        userId:new mongoose.Types.ObjectId(userId),
        amount:amount,
        type:"cradit",
        orderId:orderId
    })
}

export default{
    createWallet,
    getWallet,
    craditWallet
}