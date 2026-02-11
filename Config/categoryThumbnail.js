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

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};


export default multer({storage:cloudStorage,
    limits:{
        fileSize:1024*1024*2
    },
    fileFilter:fileFilter
  
})



