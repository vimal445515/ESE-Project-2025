
export const isLoggedIn=(req,res,next) =>
{    console.log("isLoggedIn first")
    if(!req.session.adminName ) {
        console.log(req.session.adminName)
        return next();
    }
    console.log("isLoggedIn first")
    res.redirect('/admin/home')
}
export const isAdmin = (req,res,next) =>{
    console.log('isAdmin',req.session?.adminRole)
     if(req.session.adminRole ==="admin") return next();
     res.redirect('/admin/login');
}

export const checkEmail = (req,res,next)=>{
    if(req.session.email) {
        return next()
    };
   return  res.status(404).json({status:"error",message:"user not found"})
}