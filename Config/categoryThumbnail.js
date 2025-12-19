import multer from "multer";

const storage = multer.diskStorage({
    destination(req,file,cb){
      
        cb(null,'public/upload')
    },
    filename(req,file,cb)
    {
        const name = Date.now()+"-"+file.originalname;
        cb(null,name)
    }
}) 

export default multer({storage:storage,
    limits:{
        fileSize:1024*1024*2
    },
    fileFilter:(req,file,cb)=>{
        const allowed = ["image/jpeg","image/png","image/jpg","image/webp"]
        if(allowed.includes(file.mimetype))
        {
            cb(null,true)
        }
        else{
            cb(new Error("only image file are allowed"),false);
        }
    }
})

