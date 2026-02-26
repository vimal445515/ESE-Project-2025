import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: false,
  },
  isVerifyed: {
    type: Boolean,
    required: false,
  },
});
const admin = mongoose.model("admin", adminSchema);

export default { admin };
