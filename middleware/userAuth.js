import user from "../Service/userService.js"


const checkEmailExists= async (req,res,next)=>{
    
    const {email} = req.body;
    const isTrue = await user.findUserFromDB(email)
    if(!isTrue) return next();
   return res.status(409).json({status:"error",message:"User already exeists"});
}

const isLoggedIn=(req,res,next) =>
{
    if(!req.session.userName) return next();
    res.redirect('/home')
}
const isUser = (req,res,next) =>{
    if(req.session.role !== "user") {
        return res.render('User/login',{userName:null,status:null,message:null});
    }
    else{
  return next()
    }
}

const checkEmail = (req,res,next)=>{
    if(req.session.email) return next();
    res.status(404).json({status:"error",message:"user not found"})
}

const checkUser = async (req,res,next)=>{
    const isTrue = await user.findUserFromDB(req.session.email)
    if(isTrue) return next();
    req.session.userName = null
    req.session.role = null
    req.session.email = null
    req.session.phoneNumber  = null
    res.redirect("/login");
}


export default {
    checkEmailExists,
    isLoggedIn,
    isUser,
    checkEmail,
    checkUser
}