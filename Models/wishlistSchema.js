import mongoose, { Schema } from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model("wishlist", wishlistSchema);
