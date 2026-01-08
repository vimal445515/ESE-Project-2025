import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";


const cloudStorage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"image",
        allowed_formats:["jpg", "jpeg", "png", "webp"],
        public_id:(req,file)=>{
            return  Date.now()+"-"+file.originalname.split('.')[0];
        }
    }
})



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


export default multer({storage:cloudStorage,
    limits:{
        fileSize:1024*1024*2
    },
    // fileFilter:(req,file,cb)=>{
    //     const allowed = ["image/jpeg","image/png","image/jpg","image/webp"]
    //     if(allowed.includes(file.mimetype))
    //     {
    //         cb(null,true)
    //     }
    //     else{
    //         cb(new Error("only image file are allowed"),false);
    //     }
    // }
})

// export default multer({storage:storage,
//     limits:{
//         fileSize:1024*1024*2
//     },
//     fileFilter:(req,file,cb)=>{
//         const allowed = ["image/jpeg","image/png","image/jpg","image/webp"]
//         if(allowed.includes(file.mimetype))
//         {
//             cb(null,true)
//         }
//         else{
//             cb(new Error("only image file are allowed"),false);
//         }
//     }
// })

