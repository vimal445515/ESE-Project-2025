import express from "express";
import {connectDb} from './Config/mongoConfig.js'
import adminRouter from "./Routers/adminRouter.js"
import userRouter from "./Routers/userRouter.js"
import path from "path"
import { fileURLToPath } from "url";
import {sessionMiddleware} from "./Config/sessionConfig.js"
import nocache from "nocache";
import env from 'dotenv'
import passport from './Config/passport.js'
import addressRouter from './Routers/addressRouter.js'
import cartRoutere  from './Routers/cartRouter.js'
import wishListRouter from "./Routers/whislistRouter.js"
import checkoutRouter from './Routers/checkoutRouter.js'
import orderRouter from './Routers/orderRouter.js'
import invoiceRoutes from "./Routers/invoiceRouter.js";
import reviewRouter from "./Routers/reviewRouter.js"
import flash from 'connect-flash'
import errorHandlingMiddleware from './middleware/errorHandlingMiddleware.js'
import cloudinary from "./config/cloudinary.js";
import couponRouter from './Routers/couponRouter.js';
import offerRouter from './Routers/offerRouter.js'
import razorpayRouter from './Routers/razorpayRouter.js'
import salesReportRouter from './Routers/salesReportRouter.js'
import dashboardRouter from "./Routers/dashboardRouter.js";



env.config()
let app = express();
let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename)
connectDb()
cloudinary.api.ping()
  .then(() => console.log("Cloudinary connected "))
  .catch(err => console.error("Cloudinary error ", err));

app.use(flash())
app.use(nocache())
app.use(sessionMiddleware)
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"views"))
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandlingMiddleware.notifications)
app.use("/admin",adminRouter);
app.use(userRouter)
app.use("/address",addressRouter)
app.use(cartRoutere)
app.use(wishListRouter)
app.use(checkoutRouter)
app.use("/orders",orderRouter)
app.use(invoiceRoutes);
app.use(reviewRouter);
app.use(couponRouter)
app.use(razorpayRouter)
app.use('/offers',offerRouter)
app.use(salesReportRouter);
app.use(dashboardRouter);
app.use(errorHandlingMiddleware.error)
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})