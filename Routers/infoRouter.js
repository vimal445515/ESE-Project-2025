import infoController from "../Controllers/infoController.js";
import { Router } from "express";

const router = new Router();

router.get("/about", (req, res) => {
  if (req.session?.productId) {
    delete req.session.productId;
    delete req.session.variantId;
  }
  res
    .status(200)
    .render("User/aboutPage", {
      userName: req.session?.userName || null,
      profile: req.session?.profile || null,
    });
});
router.get("/404Page", (req, res) => {
  res
    .status(404)
    .render("User/404Page", {
      userName: req.session?.userName || null,
      profile: req.session?.profile || null,
    });
});

router.get("/contact", (req, res) => {
  if (req.session?.productId) {
    delete req.session.productId;
    delete req.session.variantId;
  }
  res
    .status(200)
    .render("User/contactPage", {
      userName: req.session?.userName || null,
      profile: req.session?.profile || null,
    });
});

router.get("/500Error", (req, res) => {
  res.status(500).render("User/500Page");
});

router.post("/contact", infoController.sendMessage);
export default router;
