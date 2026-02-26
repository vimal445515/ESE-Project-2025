import reviewModel from "../Models/reviewSchema.js";

const storeReviewInDB = async (
  rating,
  productId,
  variantId,
  userName,
  profile,
  command,
) => {
  await reviewModel.create({
    rating,
    productId,
    variantId,
    userName,
    profile,
    command,
  });
};

const getReview = async (productId) => {
  return await reviewModel.find({ productId: productId });
};
export default {
  storeReviewInDB,
  getReview,
};
