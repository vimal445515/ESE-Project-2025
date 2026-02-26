import { walletModel, walletTransaction } from "../Models/walletSchema.js";
import mongoose from "mongoose";
import helpers from "../helpers/helpers.js";
import { User } from "../Models/userSchema.js";
const createWallet = async (userId) => {
  await walletModel.create({
    userId: new mongoose.Types.ObjectId(userId),
  });
};

const getWallet = async (userId, skip, limit) => {
  const walletData = await walletModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  const walletTransactionData = await walletTransaction
    .find({ userId: new mongoose.Types.ObjectId(userId) })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return { walletData, walletTransactionData };
};

const countTransaction = async (userId) => {
  return await walletTransaction.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });
};

const craditWallet = async (orderId, userId, amount) => {
  const wallet = await walletModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  wallet.balance += amount;
  await wallet.save();
  const transactionId = helpers.generateTransactionId();
  await walletTransaction.create({
    transactionId: transactionId,
    userId: new mongoose.Types.ObjectId(userId),
    amount: amount,
    type: "cradit",
    orderId: orderId,
  });
};

const referralReward = async (newUserId, referralCode) => {
  const referedUser = await User.findOne({ referralId: referralCode });
  const newUserWallet = await walletModel.findOne({
    userId: new mongoose.Types.ObjectId(newUserId),
  });
  newUserWallet.balance += 20;

  const referedUserWallet = await walletModel.findOne({
    userId: new mongoose.Types.ObjectId(referedUser._id),
  });
  referedUserWallet.balance += 50;

  await newUserWallet.save();
  await referedUserWallet.save();

  let transactionId = helpers.generateTransactionId();
  await walletTransaction.create({
    transactionId: transactionId,
    userId: new mongoose.Types.ObjectId(newUserId),
    amount: 20,
    type: "cradit",
    orderId: null,
  });

  transactionId = helpers.generateTransactionId();
  await walletTransaction.create({
    transactionId: transactionId,
    userId: new mongoose.Types.ObjectId(referedUser._id),
    amount: 50,
    type: "cradit",
    orderId: null,
  });
};

export default {
  createWallet,
  getWallet,
  craditWallet,
  referralReward,
  countTransaction,
};
