import mongoose from "mongoose";
import orderModel from "../Models/orderSchema.js";
import { productModel } from "../Models/productSchema.js";
import helper from "../helpers/helpers.js";
import cartModel from "../Models/cartSchema.js";
import addressModel from "../Models/addressSchema.js";
import orderReturnModel from "../Models/orderReturnSchema.js";
import wishlistModel from "../Models/wishlistSchema.js";
import cartService from "./cartService.js";
import { couponModel, couponUseCount } from "../Models/couponSchema.js";
import walletService from "./walletService.js";
import { walletModel, walletTransaction } from "../Models/walletSchema.js";
import helpers from "../helpers/helpers.js";

const orderSingleProduct = async (
  productId,
  variantId,
  categoryId,
  quantity,
  userId,
  productName,
  generalPhoto,
  paymentMethod,
  reqObj,
  orderDetails,
  price,
  discount,
  productFinalPrice,
  productOfferPrice,
  couponAppliedFinalPrice = null,
  coupon = null,
  orderStatus = "placed",
) => {
  if (paymentMethod === "cod" && orderDetails.total > 1000) {
    throw new Error(
      "Cash on Delivery is available only for orders up to ₹1000. To proceed with this order, please choose an online payment option.",
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  let errorMessage = "orderFaild";

  try {
    if (paymentMethod === "wallet") {
      const wallet = await walletModel
        .findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .session(session);

      if (wallet.balance < orderDetails.total) {
        errorMessage =
          "Your wallet balance is less than the order total. Please use another payment method ";
        throw new Error(
          "Your wallet balance is less than the order total. Please use another payment method ",
        );
      } else {
        wallet.balance = wallet.balance - orderDetails.total;
        await wallet.save({ session });

        let transactionId = helpers.generateTransactionId();
        await walletTransaction.create(
          [
            {
              transactionId: transactionId,
              userId: new mongoose.Types.ObjectId(userId),
              amount: orderDetails.total,
              type: "debit",
              orderId: null,
              reason: "Order",
            },
          ],
          { session },
        );
      }
    }

    // Reduce stock

    await productModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $inc: { "variants.$[variant].stock": -Number(quantity) } },
      { arrayFilters: [{ "variant._id": variantId }], session },
    );

    let couponData;
    if (coupon) {
      couponData = await couponModel
        .findOne({ couponCode: coupon })
        .session(session);
      couponData = {
        couponCode: couponData.couponCode,
        discount: couponData.discount,
        maximumDiscount: couponData.maximumDiscount,
        minimumOrder: couponData.minimumOrder,
      };
      await couponUseCount.create([{ userId, couponCode: coupon }], {
        session,
      });
    } else {
      couponData = null;
    }

    //create order
    const orderId = helper.generateOrderId();
    const data = await orderModel.create(
      [
        {
          userId: userId,
          orderId: orderId,
          items: [
            {
              productId: productId,
              variantId: variantId,
              categoryId: categoryId,
              quantity: quantity,
              offerPrice: productOfferPrice,
              couponAppliedFinalPrice: couponAppliedFinalPrice,
              finalPrice: Number(
                productFinalPrice + (18 / 100) * productFinalPrice,
              ),
              productName: productName,
              price: parseInt(price - (discount / 100) * price),
              image: generalPhoto?.url,
            },
          ],
          payment: {
            method: paymentMethod,
            status: paymentMethod === "wallet" ? "paid" : "pending",
          },
          address: {
            userName: reqObj.userName,
            companyName: reqObj.companyName,
            address: reqObj.address,
            pinCode: reqObj.pinCode,
            country: reqObj.country,
            state: reqObj.state,
            district: reqObj.city,
            email: reqObj.email,
            phoneNumber: reqObj.phoneNumber,
          },
          pricing: {
            subTotal: orderDetails.totalPriceCartItem,
            discount: orderDetails.totalDiscountPrice,
            offerDiscount: orderDetails.offerDiscount,
            couponDiscount: orderDetails?.couponDiscount
              ? orderDetails.couponDiscount
              : 0,
            tax: orderDetails.tax,
            totalAmount: orderDetails.total,
          },
          coupon: couponData,
          orderStatus: paymentMethod === "razorpay" ? "pending" : "placed",
        },
      ],
      { session },
    );
    await session.commitTransaction();
    session.endSession();
    return data;
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    throw new Error(errorMessage);
  } finally {
    session.endSession();
  }
};

const orderCartItmes = async (
  products,
  orderDetails,
  reqObj,
  userId,
  coupon = null,
  paymentMethod,
) => {
  let items = [];

  if (reqObj.payment === "cod" && orderDetails.total > 1000) {
    throw new Error(
      "Cash on Delivery is available only for orders up to ₹1000. To proceed with this order, please choose an online payment option.",
    );
  }
  let errorMessage = "order Faild";
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (reqObj.payment === "wallet") {
      const wallet = await walletModel
        .findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .session(session);

      if (wallet.balance < orderDetails.total) {
        errorMessage =
          "Your wallet balance is less than the order total. Please use another payment method ";
        throw new Error(
          "Your wallet balance is less than the order total. Please use another payment method ",
        );
      } else {
        wallet.balance = wallet.balance - orderDetails.total;
        await wallet.save({ session });

        let transactionId = helpers.generateTransactionId();
        await walletTransaction.create(
          [
            {
              transactionId: transactionId,
              userId: new mongoose.Types.ObjectId(userId),
              amount: orderDetails.total,
              type: "debit",
              reason: "Order",
              orderId: null,
            },
          ],
          { session },
        );
      }
    }

    for (let product of products) {
      items.push({
        productId: product.productId,
        variantId: product.variantId,
        categoryId: product.product.categoryId,
        productName: product.product.productName,
        quantity: product.quantity,
        couponAppliedFinalPrice: product?.couponAppliedFinalPrice || null,
        offerPrice: product.offerDiscountAmount,
        finalPrice: product.finalPrice,
        price: parseInt(
          product.product.variants.price -
            (product.product.discound / 100) * product.product.variants.price,
        ),
        image: product.product.generalPhoto.url,
      });

      await productModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(product.productId) },
        { $inc: { "variants.$[variant].stock": -parseInt(product.quantity) } },
        {
          arrayFilters: [{ "variant._id": product.variantId }],
          session,
        },
      );

      await wishlistModel.deleteOne(
        { productId: product.productId, variantId: product.variantId },
        { session },
      );
    }
    let couponData;
    if (coupon) {
      couponData = await couponModel
        .findOne({ couponCode: coupon })
        .session(session);
      couponData = {
        couponCode: couponData.couponCode,
        discount: couponData.discount,
        maximumDiscount: couponData.maximumDiscount,
        minimumOrder: couponData.minimumOrder,
      };
      await couponUseCount.create([{ userId, couponCode: coupon }], {
        session,
      });
    } else {
      couponData = null;
    }

    const orderId = helper.generateOrderId();

    const data = await orderModel.create(
      [
        {
          userId: userId,
          orderId: orderId,
          items: items,
          payment: {
            method: reqObj.payment,
          },
          address: {
            userName: reqObj.userName,
            companyName: reqObj.companyName,
            address: reqObj.address,
            pinCode: reqObj.pinCode,
            country: reqObj.country,
            state: reqObj.state,
            district: reqObj.city,
            email: reqObj.email,
            phoneNumber: reqObj.phoneNumber,
          },
          pricing: {
            subTotal: Number(orderDetails.totalPriceCartItem).toFixed(2),
            discount: Number(orderDetails.totalDiscountPrice).toFixed(2),
            offerDiscount: Number(orderDetails.offerDiscount).toFixed(2),
            couponDiscount: orderDetails?.couponDiscount
              ? Number(orderDetails.couponDiscount).toFixed(2)
              : 0,
            tax: Number(orderDetails.tax).toFixed(2),
            totalAmount: Number(orderDetails.total).toFixed(2),
          },
          coupon: couponData,
        },
      ],
      { session },
    );

    await cartModel.deleteMany({ userId: userId }, { session });
    await session.commitTransaction();
    return data;
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    throw new Error(errorMessage);
  } finally {
    session.endSession();
  }
};

const checkOrderStock = async (productId, variantId) => {
  console.log("this is wrking", productId, variantId);
  const product = await productModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    { $unwind: "$variants" },
    { $match: { "variants._id": new mongoose.Types.ObjectId(variantId) } },
  ]);

  if (product.length === 0 || Number(product[0]?.variants?.stock) < 1) {
    return false;
  }

  return true;
};

const checkOrderStockAndQuantity = async (productId, variantId, quantity) => {
  const product = await productModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    { $unwind: "$variants" },
    { $match: { "variants._id": new mongoose.Types.ObjectId(variantId) } },
  ]);

  if (quantity > Number(product[0]?.variants?.stock)) {
    return { stock: Number(product[0]?.variants?.stock), valid: false };
  }

  return { valid: true };
};

const checkOrderStockForCart = async (products) => {
  let flag = true;
  let outOfStockProducts = "";
  for (let item of products) {
    const product = await productModel.aggregate([
      { $match: { _id: item.productId } },
      { $unwind: "$variants" },
      { $match: { "variants._id": item.variantId } },
    ]);

    if (
      product[0].variants.stock < 1 ||
      item.quantity > product[0].variants.stock
    ) {
      flag = false;
      outOfStockProducts += " " + product[0].productName;
    }
  }
  console.log(flag);
  return { flag, outOfStockProducts };
};

const getSingleOrder = async (orderId) => {
  const order = await orderModel.find({ orderId: orderId });
  let block = false;
  if (order[0].orderStatus !== "delivered") {
    order[0].items.forEach((item) => {
      if (item.status === "cancelled") block = true;
    });
  } else {
    order[0].items.forEach((item) => {
      if (item.status === "return") block = true;
    });
  }

  return { order, block };
};

const getSingleOrderById = async (orderId) => {
  return await orderModel.find({ _id: orderId });
};

const getOrders = async (userId, skip, limit) => {
  return await orderModel
    .find({ userId: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};
const countOrders = async (userId) => {
  return await orderModel.countDocuments({ userId });
};

const getAllOrders = async (skip, limit, sort, orderId, filter) => {
  let pipeline = [];
  pipeline.push({
    $match: {
      $and: [
        { orderStatus: { $ne: "pending" } },
        { orderStatus: { $ne: "paymentFailed" } },
      ],
    },
  });
  if (orderId) {
    pipeline.push({ $match: { orderId: orderId } });
  }

  if (sort) {
    switch (sort) {
      case "ltoH":
        pipeline.push({ $sort: { "pricing.totalAmount": 1 } });
        break;
      case "htoL":
        pipeline.push({ $sort: { "pricing.totalAmount": -1 } });
        break;
      case "new":
        pipeline.push({ $sort: { createdAt: -1 } });
        break;
      case "old":
        pipeline.push({ $sort: { createdAt: 1 } });
        break;
    }
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }
  if (filter) {
    switch (filter) {
      case "processing":
        pipeline.push({ $match: { orderStatus: "placed" } });
        break;
      case "shipped":
        pipeline.push({ $match: { orderStatus: "shipped" } });
        break;
      case "delivered":
        pipeline.push({ $match: { orderStatus: "delivered" } });
        break;
      case "canceled":
        pipeline.push({ $match: { orderStatus: "canceled" } });
        break;
    }
  }

  pipeline.push({ $skip: skip }, { $limit: limit });

  return await orderModel.aggregate(pipeline);
  // return await orderModel.find().sort({"createdAt":-1}).skip(skip).limit(limit)
};

const getAllOrdersCount = async () => {
  return await orderModel.countDocuments({ orderStatus: { $ne: "pending" } });
};

const unlistOrder = async (orderId) => {
  await orderModel.findOneAndUpdate({ _id: orderId }, { isDeleted: true });
};

const listOrder = async (orderId) => {
  await orderModel.findOneAndUpdate(
    { _id: orderId },
    { $set: { isDeleted: false } },
  );
};

const updateData = async (orderId, orderStatus) => {
  await orderModel.findOneAndUpdate(
    { _id: orderId },
    { $set: { orderStatus: orderStatus } },
  );
};

const getOrderById = async (orderId, sort) => {
  let pipeline = [];

  if (sort) {
    switch (sort) {
      case "ltoH":
        pipeline.puhs({ $sort: { totalAmout: -1 } });
        break;
      case "htoL":
        pipeline.puhs({ $sort: { totalAmount: 1 } });
        break;
      case "new":
        pipeline.push({ $sort: { createdAt: -1 } });
        break;
      case "old":
        pipeline.push({ $sort: { createAt: -1 } });
        break;
    }
  }

  if (orderId) {
    pipeline.push({ $match: { orderId: orderId } });
  }
  return await orderModel.aggregate(pipeline);
};

const updateOrderCancel = async (orderId) => {
  const items = await orderModel.findOne(
    { _id: orderId },
    { items: 1, _id: 0 },
  );
  items.items.forEach((item) => {
    if (item.status === "cancelled")
      throw new Error("order item already cancelled.");
  });
  for (let item of items.items) {
    await productModel.findOneAndUpdate(
      { _id: item.productId },
      { $inc: { "variants.$[variant].stock": item.quantity } },
      { arrayFilters: [{ "variant._id": item.variantId }] },
    );
  }

  const order = await orderModel.findOneAndUpdate(
    { _id: orderId },
    { $set: { orderStatus: "canceled" } },
  );
  if (order.payment.status === "paid" && order.orderStatus != "canceled") {
    const amount = order.pricing.totalAmount;
    await walletService.craditWallet(order.orderId, order.userId, amount);
  }
  return order;
};

const searchByUser = async (userId, orderId) => {
  return await orderModel.find({ userId: userId, orderId: orderId });
};

const storeReturnOrderData = async (orderId, reason) => {
  const orderItems = await orderModel.findOne({ _id: orderId }, { items: 1 });
  for (let orderItem of orderItems.items) {
    if (orderItem.status === "return")
      throw new Error(
        "order product already returned this action canot be performed. you can return one product at a time.",
      );
  }
  if (!(await orderReturnModel.findOne({ orderId: orderId, type: "all" }))) {
    await orderReturnModel.create({ orderId, reason, type: "all" });
    return await orderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
    });
  }
  throw new Error("Canot request more than one time !");
};
const storeSingleReturnOrderData = async (
  orderId,
  reason,
  productId,
  variantId,
) => {
  const productName = await productModel.find(
    { _id: productId },
    { productName: 1, _id: 0 },
  );

  const isPresent = await orderReturnModel.findOne({
    orderId: new mongoose.Types.ObjectId(orderId),
    "product.variantId": new mongoose.Types.ObjectId(variantId),
  });
  const isReturnAllProducts = await orderReturnModel.findOne({
    orderId: new mongoose.Types.ObjectId(orderId),
    type: "all",
  });
  if (isPresent || isReturnAllProducts) {
    throw new Error("Canot request more than one time !");
  } else {
    await orderReturnModel.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      reason,
      type: "single",
      product: {
        productName: productName[0].productName,
        productId: new mongoose.Types.ObjectId(productId),
        variantId: new mongoose.Types.ObjectId(variantId),
      },
    });
    return await orderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
    });
  }
};

const getAllReturnNotifications = async () => {
  return await orderReturnModel
    .find({ status: "pending" })
    .sort({ createdAt: -1 });
};

const deletereturnOrder = async (orderId, type) => {
  await orderReturnModel.findOneAndUpdate(
    { orderId: orderId, type },
    { $set: { status: "rejected" } },
  );
};

const acceptOrderReturn = async (orderId, userId) => {
  console.log("accepted succussfuly", orderId);
  const returnOrder = await orderReturnModel.findOneAndUpdate(
    { orderId: orderId, type: "all" },
    { $set: { status: "accept" } },
  );
  const order = await orderModel.findOneAndUpdate(
    { _id: orderId },
    { $set: { orderStatus: "return" } },
  );

  if (
    order.payment.method === "razorpay" ||
    order.payment.method === "wallet"
  ) {
    await walletModel.findOneAndUpdate(
      { userId: userId },
      { $inc: { balance: order.pricing.totalAmount } },
    );
    let transactionId = helpers.generateTransactionId();
    await walletTransaction.create({
      transactionId: transactionId,
      userId: new mongoose.Types.ObjectId(userId),
      amount: order.pricing.totalAmount,
      reason: "refund",
      type: "cradit",
      orderId: order.orderId,
    });
  }
};

const getOrderDataForDashbord = async (userId) => {
  const pending = await orderModel.countDocuments({
    userId,
    $or: [
      { orderStatus: { $eq: "placed" } },
      { orderStatus: { $eq: "shippend" } },
    ],
  });
  const totalOrder = await orderModel.countDocuments({ userId });
  const completed = await orderModel.countDocuments({
    userId,
    orderStatus: "delivered",
  });
  return { pending, totalOrder, completed };
};

const cancelSingleProduct = async (
  orderId,
  productId,
  variantId,
  quantity,
  userId,
) => {
  const allItems = await orderModel.findOneAndUpdate(
    { _id: orderId },
    {
      $set: { "items.$[product].status": "cancelled" },
    },
    {
      arrayFilters: [{ "product.variantId": variantId }],
    },
  );

  await productModel.findOneAndUpdate(
    { _id: productId },
    { $inc: { "variants.$[variant].stock": quantity } },
    { arrayFilters: [{ "variant._id": variantId }] },
  );
  let order = await orderModel.findOne({ _id: orderId });
  console.log("this is order ", order);
  let subTotal = 0;
  for (let item of order.items) {
    if (item.status === "placed") {
      subTotal += item.price;
    }
  }
  let tax = (subTotal * 18) / 100;
  let totalAmount = subTotal + tax;

  const orderData = await orderModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
    { $unwind: "$items" },
    { $match: { "items.variantId": new mongoose.Types.ObjectId(variantId) } },
  ]);
  let coupon = null;
  let couponDiscount = 0;
  if (orderData[0].coupon) {
    if (totalAmount > orderData[0].coupon.minimumOrder) {
      coupon = orderData[0].coupon;
      couponDiscount = Math.round(
        (totalAmount * orderData[0].coupon.discount) / 100,
      );
      if (couponDiscount > orderData[0].coupon.maximumDiscount) {
        couponDiscount = orderData[0].coupon.maximumDiscount;
      }
    }

    if (allItems.items.length === 1) {
      orderData[0].items.finalPrice = orderData[0].pricing.totalAmount;
    } else {
      orderData[0].items.finalPrice =
        orderData[0].items.couponAppliedFinalPrice +
        orderData[0].items.couponAppliedFinalPrice * (18 / 100);
    }
  }

  let discount =
    Math.round(orderData[0].pricing.offerDiscount) -
    Math.round(orderData[0].items.offerPrice);

  order = await orderModel.findOneAndUpdate(
    { _id: orderId },
    {
      $set: {
        "pricing.subTotal": subTotal,
        "pricing.tax": tax,
        "pricing.offerDiscount": discount,
        "pricing.couponDiscount": couponDiscount,
        "pricing.totalAmount": totalAmount,
        "pricing.discount": discount + couponDiscount,
        coupon: coupon,
      },
    },
  );

  if (
    orderData[0].payment.method === "razorpay" ||
    orderData[0].payment.method === "wallet"
  ) {
    const wallet = await walletModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    wallet.balance =
      wallet.balance + Number(orderData[0].items.finalPrice.toFixed(2));
    await wallet.save();

    let transactionId = helpers.generateTransactionId();
    await walletTransaction.create({
      transactionId: transactionId,
      userId: new mongoose.Types.ObjectId(userId),
      amount: Number(orderData[0].items.finalPrice.toFixed(2)),
      type: "cradit",
      reason: "Order Cancel",
      orderId: orderData[0].orderId,
    });
  }

  return order;
};

const rejectSingleReturnProduct = async (orderId, variantId, productId) => {

  const data = await orderReturnModel.findOneAndUpdate(
    {
      orderId: orderId,
      type: "single",
      "product.variantId": new mongoose.Types.ObjectId(variantId),
    },
    { $set: { status: "rejected" } },
  );
};

const aproveSingleReturnProduct = async (orderId, variantId, productId) => {
  const returnOrder = await orderReturnModel.findOneAndUpdate(
    {
      orderId: orderId,
      type: "single",
      "product.variantId": new mongoose.Types.ObjectId(variantId),
    },
    { $set: { status: "approved" } },
  );

  let order = await orderModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(orderId) },
    {
      $set: { "items.$[item].status": "return" },
    },
    {
      arrayFilters: [
        { "item.variantId": new mongoose.Types.ObjectId(variantId) },
      ],
    },
  );
  const orderData = order;
  if (returnOrder?.product) {
    order = await orderModel.aggregate([
      { $match: { _id: order._id } },
      { $unwind: "$items" },
      {
        $match: { "items.variantId": returnOrder.product.variantId },
      },
    ]);
    if (
      order[0].payment.method === "razorpay" ||
      order[0].payment.method === "wallet"
    ) {
      let price = order[0].items.finalPrice;
      if (order[0].coupon) {
        console.log(order[0].items.length);
        if (orderData.items.length === 1) {
          price = order[0].pricing.totalAmount;
        } else {
          price =
            order[0].items.couponAppliedFinalPrice +
            order[0].items.couponAppliedFinalPrice * (18 / 100);
        }
      }
      await walletModel.findOneAndUpdate(
        { userId: order[0].userId },
        { $inc: { balance: Number(price) } },
      );
      let transactionId = helpers.generateTransactionId();
      await walletTransaction.create({
        transactionId: transactionId,
        userId: new mongoose.Types.ObjectId(order[0].userId),
        amount: price,
        reason: "Refund",
        type: "cradit",
        orderId: order[0].orderId,
      });
    }
  }
};

const getOrdersForSalesReport = async (startDate, endDate, skip, limit) => {
  if (startDate) {
    return await orderModel.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          createdAt: 1,
          orderId: 1,
          "user.userName": 1,
          pricing: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
  }
  return await orderModel.aggregate([
    { $match: { orderStatus: "delivered" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        createdAt: 1,
        orderId: 1,
        "user.userName": 1,
        pricing: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
};

const getOrdersForSalesReportDownload = async (startDate, endDate) => {
  if (startDate) {
    return await orderModel.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          createdAt: 1,
          orderId: 1,
          "user.userName": 1,
          pricing: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }
  return await orderModel.aggregate([
    { $match: { orderStatus: "delivered" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        createdAt: 1,
        orderId: 1,
        "user.userName": 1,
        pricing: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
};

const countDeliveredOrders = async (startDate, endDate) => {
  const query = {};

  query.orderStatus = "delivered";
  if (startDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }
  return await orderModel.countDocuments(query);
};

export default {
  orderSingleProduct,
  orderCartItmes,
  getOrders,
  countOrders,
  getSingleOrder,
  getSingleOrderById,
  getAllOrders,
  getAllOrdersCount,
  unlistOrder,
  listOrder,
  updateData,
  getOrderById,
  updateOrderCancel,
  searchByUser,
  storeReturnOrderData,
  getAllReturnNotifications,
  deletereturnOrder,
  acceptOrderReturn,
  checkOrderStock,
  checkOrderStockForCart,
  getOrderDataForDashbord,
  cancelSingleProduct,
  storeSingleReturnOrderData,
  rejectSingleReturnProduct,
  aproveSingleReturnProduct,
  getOrdersForSalesReport,
  countDeliveredOrders,
  getOrdersForSalesReportDownload,
  checkOrderStockAndQuantity,
};
