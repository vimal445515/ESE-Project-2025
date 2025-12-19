import fs from 'fs'
import {fileURLToPath} from 'url'
import path from 'path'

const structureProductData = (image,info) =>{
let imageObj = {...image}
let obj = {...info}
let length = Object.keys(imageObj).length;
delete imageObj[length-1]
delete obj.productName
delete obj.basePrice
delete obj.discound
delete obj.generalPhoto
delete obj.category
delete obj.description
length = Object.keys(imageObj).length;





let objArray =  Object.entries(obj);
let resultArray = []
let imgObj = {}


for(let i = 0; i < length/4;i++){
  
  imgObj[`img1${i}`] = imageObj[`${i}`]?.filename
  imgObj[`img2${i}`] = imageObj[`${i+1}`]?.filename
  imgObj[`img3${i}`] = imageObj[`${i+2}`]?.filename
  imgObj[`img4${i}`] = imageObj[`${i+3}`]?.filename
}

 

for(let i = 0; i < objArray.length/4; i++)
{
   resultArray.push({
     price: obj[`price${i}`],
     stock: obj[`stock${i}`],
     storage:obj[`storage${i}`],
     ram:obj[`ram${i}`],
     images:[imgObj[`img1${i}`],imgObj[`img2${i}`],imgObj[`img3${i}`],imgObj[`img4${i}`]]
   })
}


return resultArray;
}
const extractGeneralImage=(files)=>
{  const imagesObj = files
   let length = Object.keys(imagesObj).length
    return imagesObj[`${length-1}`]?.filename
}


const deleteExeistingImage = (generalPhoto,img1,img2,img3,img4,data) =>{

  let __filename = fileURLToPath(import.meta.url);
  let __dirname =path.dirname(path.dirname(__filename))
  let root = __dirname.split("\\").join('/')
  console.log(data.generalPhoto, generalPhoto)
  if(fs.existsSync(`${root}/public/upload/${data.generalPhoto}`) && data.generalPhoto !== generalPhoto){
    fs.unlink(`${root}/public/upload/${data.generalPhoto}`,(error)=>{
        console.log("general image deleted")
    });
  
  } 
  if(fs.existsSync(`${root}/pubilc/upload/${data.variants[0].images[0]}`) && data.variants[0].images[0] !== img1) 
  {
    fs.unlink(`${root}/public/upload/${data.variants[0].images[0]}`,(error)=>{
      console.log("img1 deleted")
    })
    
  }
     if(fs.existsSync(`${root}/pubilc/upload/${data.variants[0].images[1]}`) && data.variants[0].images[1] !== img1) {
      fs.unlink(`${root}/public/upload/${data.variants[0].images[1]}`,(error)=>{
        console.log("img2 deleted")
      })
      
     }
       if(fs.existsSync(`${root}/pubilc/upload/${ data.variants[0].images[2]}`) && data.variants[0].images[2] !== img1) {
        fs.unlink(`${root}/public/upload/${data.variants[0].images[2]}`,(error)=>{
           console.log("img2 deleted")
        })
       
       }
        if(fs.existsSync(`${root}/pubilc/upload/${data.variants[0].images[3]}`) && data.variants[0].images[3] === img1){
           fs.unlink(`${root}/public/upload/${data.variants[0].images[3]}`,(error)=>{
              console.log("img2 deleted")
           })
         
        }
 
}
export default {
    structureProductData,
    extractGeneralImage,
    deleteExeistingImage
}