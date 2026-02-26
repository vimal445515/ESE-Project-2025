import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  price: {
    type: Number,
    require: true,
  },
  stock: {
    type: Number,
    require: true,
  },
  storage: {
    type: Number,
    require: false,
  },
  ram: {
    type: Number,
    require: false,
  },
  images: {
    type: Array,
  },
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    require: true,
  },
  basePrice: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    index: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
    index: true,
  },
  discound: {
    type: Number,
  },
  generalPhoto: {
    url: String,
    publicId: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  variants: [variantSchema],
});

productSchema.index({ categoryId: 1, createdAt: -1, isDeleted: 1 });
productSchema.index({ categoryId: 1, "variants.price": 1 });

export const productModel = mongoose.model("product", productSchema);
