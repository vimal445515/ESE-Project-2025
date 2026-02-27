import { Router } from "express";
import wishlistController from "../Controllers/wishlist.js";
import auth from "../middleware/userAuth.js";
const router = Router();
router
  .route("/wishlist")
  .get(auth.isUser, wishlistController.loadWishListPage)
  .post(auth.isUser, wishlistController.storeWishlistData)
  .delete(auth.isUser, wishlistController.deleteWislistItem);
router.post("/wishlist/unlike", wishlistController.unlike);
export default router;
