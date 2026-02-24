import mongoose from "mongoose";

const orderReturnSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  status: {
    type: String,
    default: "pending",
  },
  reason: {
    type: String,
  },
  product: {
    type: Object,
  },
  type: {
    type: String,
  },
});

export default mongoose.model("orderReturn", orderReturnSchema);
