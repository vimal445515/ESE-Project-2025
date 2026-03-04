import productService from "../Service/productService.js";
import productHelper from "../helpers/productHelper.js";
import helpers from "../helpers/helpers.js";
import adminService from "../Service/adminService.js";
import wishlistService from "../Service/wishlistService.js";
import categoryService from "../Service/categoryService.js";
import reviewService from "../Service/reviewService.js";
const storeProducts = async (req, res) => {
  try {
    const { productName, basePrice, description, category, discound } =
      req.body;
    const generalPhoto = productHelper.extractGeneralImage(req.files);
    const VariantsData = productHelper.structureProductData(
      req.files,
      req.body,
    );
    const data = await productService.storeProductDataInDB(
      generalPhoto,
      productName,
      basePrice,
      description,
      category,
      discound,
      VariantsData,
    );
    return res.status(201).json("product added Successfully");
  } catch (error) {
    console.log(error);
    if ((error.message = "Invaid input")) {
      res.status(400).json({ type: "error", message: error.message });
    } else {
      res.status(500).json({ type: "error", message: "upload failed" });
    }
  }
};
const loadProductsPage = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search = req.query.search;
    const limit = 5;
    const skip = helpers.paginationSkip(page, limit);
    const products = await productService.getAllProducts(skip, limit, search);
    const count = await productService.getAllProductsCount();
    res.render("Admin/product", { products, page, limit, count });
  } catch (error) {
    console.log(error);
    res.status(500).redirect("/500Error");
  }
};

const loadEditProductPage = async (req, res) => {
  const id = req.params.id;
  const index = Number(req.query.variant) ? Number(req.query.variant) : 0;
  console.log(index, req.query.variant);
  try {
    const product = await productService.getProduct(id, index);
    const variantsData = await productService.variantCount(id);
    const productCategory = await productService.getCategory(
      product.categoryId,
    );
    const categories = await adminService.getCategoriesForProductEdit();
    res.render("Admin/EditProduct", {
      product,
      categories,
      productCategory,
      variantsData,
      index,
    });
  } catch (error) {
    console.log(error);
    res.status(500).redirect("/500Error");
  }
};
const editProduct = async (req, res) => {
  try {
    let index = req.query.variant ? Number(req.query.variant) : 0;
    let data = await productService.getProduct(req.params.id, index);

    let productName = req.body.productName || data.productName;
    let basePrice = req.body.basePrice || data.basePrice;
    let description = req.body.description || data.description;
    let category = req.body.category || data.categoryId;
    let discound = req.body.discound || data.discound;

    let variantsData = productHelper.structureProductDataForEdit(
      req.files,
      req.body,
      0,
    );
    let generalPhoto = productHelper.extractGeneralImage(req?.files);
    console.log("price this ist", data.variants.price);

    generalPhoto = generalPhoto?.publicId ? generalPhoto : data.generalPhoto;
    let variant = {};

    variant.price = variantsData[0]?.price || data.variants.price;
    variant.stock = variantsData[0]?.stock || data.variants.stock;
    variant.storage = variantsData[0]?.storage || data.variants.storage;
    variant.ram = variantsData[0]?.ram || data.variants.ram;
    variant.images = [
      variantsData[0]?.images[0]?.publicId
        ? variantsData[0]?.images[0]
        : data.variants.images[0],
      variantsData[0]?.images[1]?.publicId
        ? variantsData[0]?.images[1]
        : data.variants.images[1],
      variantsData[0]?.images[2]?.publicId
        ? variantsData[0]?.images[2]
        : data.variants.images[2],
      variantsData[0]?.images[3]?.publicId
        ? variantsData[0]?.images[3]
        : data.variants.images[3],
    ];

    await productHelper.deleteExeistingImage(
      data.generalPhoto,
      data.variants.images[0],
      data.variants.images[1],
      data.variants.images[2],
      data.variants.images[3],
      variant.images,
      generalPhoto,
    );

    data = await productService.editProductInDB(
      productName,
      basePrice,
      description,
      category,
      discound,
      generalPhoto,
      variant,
      req.params.id,
      index,
    );
    res.status(200).json({ _id: data._id });
  } catch (error) {
    console.log(error);
    if (error.message === "Invalid stock") {
      return res.status(400).json({ type: "error", message: error.message });
    }
    res.status(500).json({ type: "error", message: "somthing was wrong!" });
  }
};

const addVariant = async (req, res) => {
  let valid = true;
  try {
    if (!req.body.storage || isNaN(req.body.storage)) {
      valid = false;
    }
    if (!req.body.ram || isNaN(req.body.ram)) {
      valid = false;
    }

    if (
      !req.body.price ||
      isNaN(req.body.price) ||
      Number(req.body.price) <= 0
    ) {
      valid = false;
    }

    if (
      !req.body.stock ||
      isNaN(req.body.stock) ||
      Number(req.body.stock) < 0
    ) {
      valid = false;
    }

    if (!req.files[0]) valid = false;
    if (!req.files[1]) valid = false;
    if (!req.files[2]) valid = false;
    if (!req.files[3]) valid = false;

    if (valid) {
      const images = [
        { publicId: req.files[0].filename, url: req.files[0].path },
        { publicId: req.files[1].filename, url: req.files[1].path },
        { publicId: req.files[2].filename, url: req.files[2].path },
        { publicId: req.files[3].filename, url: req.files[3].path },
      ];
      await productService.storeVariant(images, req.body);
      return res
        .status(200)
        .json({ type: "success", message: "Variant added successfully" });
    } else {
      if (req.files) {
        await productService.deleteVariantImages(req.files);
      }
      return res.status(400).json({
        type: "error",
        message: "Invalid variant data please check every data befor upload",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "error", message: "Internal server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProductFromDB(req.params.id);
    res.status(200).json("deleted succusfully");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
};

const unDeleteProduct = async (req, res) => {
  try {
    await productService.unDeleteProductFromDB(req.params.id);
    res.status(200).json("product listed");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
};

const removeOneVariant = async (req, res) => {
  try {
    if (
      await productService.removeVariant(req.body.productId, req.body.index)
    ) {
      return res
        .status(200)
        .json({ type: "success", message: "variant removed successfully" });
    } else {
      return res.status(400).json({
        type: "warning",
        message:
          "Only one variant is currently available. A product must have at least one active variant.",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
};

const loadUserSideProductsPage = async (req, res) => {
  const page = req.query.page || 1;

  const sort = req.query.sort;
  const category = req.query.category;
  const priceRange = req.query.priceRange;
  const searchValue = req.query.search;
  if (req.session?.productId) {
    delete req.session.productId;
    delete req.session.variantId;
  }
  const limit = 12;
  try {
    const skip = helpers.paginationSkip(page, limit);
    let products = await productService.getAllProductsUserSide(
      skip,
      limit,
      sort,
      category,
      priceRange,
      searchValue,
    );
    products = await wishlistService.addLikeToProduct(
      products,
      req.session._id,
    );
    const toatalCount = await productService.getAllProductsUserSide(
      null,
      null,
      sort,
      category,
      priceRange,
      searchValue,
    );
    const count = toatalCount.length;
    const categoryNames = await categoryService.getAllCategory();
    res.render("User/products", {
      products,
      userName: req.session.userName,
      page,
      limit,
      count,
      sort,
      searchValue,
      category,
      priceRange,
      profile: req.session.profile,
      categoryNames,
    });
  } catch (error) {
    res.status(500).redirect("/500Error");
  }
};

const loadProductDetails = async (req, res) => {
  const id = req.params.id;
  const storage = req.query.rom;
  const ram = req.query.ram;
  const variantId = req.query.variantId;
  req.session.productId = id;
  req.session.variantId = variantId;
  if (req.session?.userName) {
    delete req.session.productId;
    delete req.session.variantId;
  }
  let productData;
  let isLiked = false;
  let wishlistId = null;
  try {
    const productArray = await productService.getSingleProduct(
      id,
      storage,
      ram,
      variantId,
    );
    const getVariants = await productService.getVariants(id);
    const review = await reviewService.getReview(id);
    const average = helpers.calculateAvargeRating(review);
    if (!productArray || productArray.length === 0) {
      const fallback = await productService.getSingleProduct(id);
      productData = fallback[0];
    } else {
      productData = productArray[0];
    }

    const wishlist = await wishlistService.findWishlist(
      productData._id,
      productData.variants._id,
      req.session._id,
    );

    if (wishlist) {
      isLiked = true;
      wishlistId = wishlist._id;
    }

    const categoryIsBlocked = await categoryService.isBlocked(
      productData.categoryId,
    );
    const relateditems = await productService.getRelateditems(
      productData.categoryId,
    );
    res.render("User/singleProductPage", {
      userName: req.session.userName,
      productData,
      getVariants,
      relateditems,
      ram,
      storage,
      profile: req.session.profile,
      isLiked: isLiked,
      wishlistId: wishlistId,
      review,
      avarageRating: average.toFixed(1),
      categoryIsBlocked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).redirect("/500Error");
  }
};

export default {
  storeProducts,
  loadProductsPage,
  loadEditProductPage,
  editProduct,
  deleteProduct,
  loadUserSideProductsPage,
  loadProductDetails,
  unDeleteProduct,
  removeOneVariant,
  addVariant,
};
