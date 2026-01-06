import fs from 'fs'
import {fileURLToPath} from 'url'
import path from 'path'

const structureProductData = (image,info) =>{
let imageObj = {...image}
let obj = {...info}
let key= Object.keys(imageObj).length-1;
key  = key.toString()
let length = Object.keys(imageObj).length
if(imageObj[key]?.fieldname === 'generalPhoto'){
delete imageObj[length-1]
}
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
   if( imagesObj[`${length-1}`]?.fieldname ==="generalPhoto"){
    return imagesObj[`${length-1}`]?.filename;
   }
   return undefined
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
  if(fs.existsSync(`${root}/pubilc/upload/${data.variants.images[0]}`) && data.variants.images[0] !== img1) 
  {
    fs.unlink(`${root}/public/upload/${data.variants.images[0]}`,(error)=>{
      console.log("img1 deleted")
    })
    
  }
     if(fs.existsSync(`${root}/pubilc/upload/${data.variants.images[1]}`) && data.variants.images[1] !== img1) {
      fs.unlink(`${root}/public/upload/${data.variants.images[1]}`,(error)=>{
        console.log("img2 deleted")
      })
      
     }
       if(fs.existsSync(`${root}/pubilc/upload/${ data.variants.images[2]}`) && data.variants.images[2] !== img1) {
        fs.unlink(`${root}/public/upload/${data.variants.images[2]}`,(error)=>{
           console.log("img2 deleted")
        })
       
       }
        if(fs.existsSync(`${root}/pubilc/upload/${data.variants.images[3]}`) && data.variants.images[3] === img1){
           fs.unlink(`${root}/public/upload/${data.variants.images[3]}`,(error)=>{
              console.log("img2 deleted")
           })
         
        }
 
}


const structureProductDataForEdit = (image,info,index) =>{
let imageObj = {...image}
let obj = {...info}
let key= Object.keys(imageObj).length-1;
key  = key.toString()
let length = Object.keys(imageObj).length;
if(imageObj[key]?.fieldname === 'generalPhoto'){
delete imageObj[length-1]
}
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

for(let i = 0; i < length/4; i++){
  let newKey = `${imageObj[`${i}`].fieldname}`
  imageObj[newKey] = imageObj[`${i}`]
  delete imageObj[`${i}`]
  console.log(imageObj)
}

  
  imgObj[`img1${index}`] = imageObj[`img1${index}`]?.filename
  imgObj[`img2${index}`] = imageObj[`img2${index}`]?.filename
  imgObj[`img3${index}`] = imageObj[`img3${index}`]?.filename
  imgObj[`img4${index}`] = imageObj[`img4${index}`]?.filename


 

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




export default {
    structureProductData,
    extractGeneralImage,
    deleteExeistingImage,
    structureProductDataForEdit
}