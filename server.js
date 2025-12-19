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
env.config()
let app = express();
let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename)
connectDb()

app.use(nocache())
app.use(sessionMiddleware)
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"views"))
app.use(passport.initialize());
app.use(passport.session());
app.use("/admin",adminRouter);
app.use(userRouter)

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}/admin/login`);
})