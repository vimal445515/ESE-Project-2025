import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    required: true,
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 1000),
  },
});
otpSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60,
  },
);

export const OtpModel = mongoose.model("otp", otpSchema);
