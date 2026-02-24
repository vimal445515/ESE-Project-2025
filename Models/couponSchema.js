import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    unique: true,
  },
  discount: {
    type: Number,
  },
  minimumOrder: {
    type: Number,
  },
  maximumDiscount: {
    type: Number,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const couponUser = new mongoose.Schema({
  userId: {
    required: true,
    type: mongoose.Types.ObjectId,
  },
  couponCode: {
    required: true,
    type: String,
  },
  userdCount: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const couponModel = new mongoose.model("coupon", couponSchema);
export const couponUseCount = new mongoose.model("couponUseCount", couponUser);
