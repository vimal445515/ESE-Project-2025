import reviewService from "../Service/reviewService.js";
import orderSevice from "../Service/orderSevice.js";

const storeReview = async (req, res) => {
  try {
    const { rating, productId, variantId, userName, profile, command } =
      req.body;
    await reviewService.storeReviewInDB(
      rating,
      productId,
      variantId,
      userName,
      profile,
      command,
    );
    const order = await orderSevice.getSingleOrder(req.body.orderId);
    console.log(order);
    res.render("User/orderDetails", {
      userName: req.session.userName,
      profile: req.session.profile,
      order: order?.order[0],
      type: "success",
      message: "Review Added successfully",
      block: order?.block
    });
  } catch (error) {
    res.render("User/orderDetails", {
      userName: req.session.userName,
      profile: req.session.profile,
       order: order?.order[0],
      type: "error",
      message: "! Oops somthing was wrong",
       block: order?.block
    });
  }
};

export default {
  storeReview,
};
