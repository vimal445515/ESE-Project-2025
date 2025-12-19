
export const isLoggedIn=(req,res,next) =>
{
    if(!req.session.adminName ) return next();
    res.redirect('/admin/home')
}
export const isAdmin = (req,res,next) =>{
     if(req.session.adminRole ==="admin") return next();
     res.redirect('/admin/login');
}

export const checkEmail = (req,res,next)=>{
    if(req.session.email) {
        return next()
    };
   return  res.status(404).json({status:"error",message:"user not found"})
}