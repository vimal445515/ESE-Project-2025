const error =(error,req,res,next)=>{
    const isFetch = req.headers["content-type"]?.includes("application/json") ||req.headers["content-type"]?.includes("multipart/form-data") || req.headers["x-requested-with"] === "XMLHttpRequest";
    if(isFetch){
         if(error?.code==="LIMIT_FILE_SIZE"){
            req.flash("error",'File have a limit 2MB')
            res.status(415).json({obj:req.originalUrl})
         }
         else if(error.message === "only image file are allowed"){
            req.flash("error",error.message)
            res.status(415).json({obj:req.originalUrl})
         }


    }else{
         if(error?.code==="LIMIT_FILE_SIZE"){
        req.flash("error",'File have a limit 2MB')
        res.status(415).redirect("back")
    }
    else if(error.message === "only image file are allowed"){
            req.flash("error",error.message)
             res.status(415).redirect("back")
         }
    }
    next()
   
}

const notifications = (req,res,next)=>{
    
    res.locals.error = req.flash("error")
    res.locals.success  = req.flash("success")
    next()
}

export default {
    error,
    notifications
}