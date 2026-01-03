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


env.config()
let app = express();
let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename)
connectDb()

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


app.use((req,res,next)=>{
    res.locals.error = req.flash("error")
    res.locals.success  = req.flash("success")
    next()
})

app.use("/admin",adminRouter);
app.use(userRouter)
app.use("/address",addressRouter)
app.use(cartRoutere)
app.use(wishListRouter)
app.use(checkoutRouter)
app.use("/orders",orderRouter)
app.use(invoiceRoutes);
app.use(reviewRouter);


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})