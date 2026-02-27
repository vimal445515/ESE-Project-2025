import fs from 'fs'
import {fileURLToPath} from 'url'
import path from 'path'
import cloudinary from '../Config/cloudinary.js'

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
  let index = i*4;
  imgObj[`img1${i}`] = imageObj[`${index}`]?.filename
  imgObj[`url1${i}`] = imageObj[`${index}`].path

  imgObj[`img2${i}`] = imageObj[`${index+1}`]?.filename
  imgObj[`url2${i}`] = imageObj[`${index+1}`].path

  imgObj[`img3${i}`] = imageObj[`${index+2}`]?.filename
  imgObj[`url3${i}`] = imageObj[`${index+2}`].path

  imgObj[`img4${i}`] = imageObj[`${index+3}`]?.filename
  imgObj[`url4${i}`] = imageObj[`${index+3}`].path
}


for(let i = 0; i < objArray.length/4; i++)
{
  if(obj[`price${i}`] < 0 || isNaN(obj[`price${i}`]) || obj[`stock${i}`] <0 || isNaN(obj[`stock${i}`]) ){
    throw new Error("Invaid input");
  }
   resultArray.push({
     price: obj[`price${i}`],
     stock: obj[`stock${i}`],
     storage:obj[`storage${i}`],
     ram:obj[`ram${i}`],
     images:[{publicId:imgObj[`img1${i}`],url:imgObj[`url1${i}`]}  ,  {publicId:imgObj[`img2${i}`],url:imgObj[`url2${i}`]}  ,  {publicId:imgObj[`img3${i}`],url:imgObj[`url3${i}`]} ,  {publicId:imgObj[`img4${i}`],url:imgObj[`url4${i}`]}]
   }) 
}


return resultArray;
}
const extractGeneralImage=(files)=>
{  const imagesObj = files
   let length = Object.keys(imagesObj).length
   if( imagesObj[`${length-1}`]?.fieldname ==="generalPhoto"){
    return {publicId:imagesObj[`${length-1}`]?.filename,url:imagesObj[`${length-1}`].path}
   }
   return undefined
}


const deleteExeistingImage = async(generalPhoto,img1,img2,img3,img4,newImages=[],newGeneralImage) =>{
  
  if(generalPhoto?.publicId !== newGeneralImage?.publicId && generalPhoto?.publicId ){
    console.log("deleteing generalPhoto")
    await   cloudinary.uploader.destroy(generalPhoto.publicId)
  }

  if(img1?.publicId !== newImages[0]?.publicId && img1?.publicId){
    console.log("deleteing first image")
   await cloudinary.uploader.destroy(img1.publicId)
  }

  if(img2?.publicId !== newImages[1]?.publicId && img2?.publicId ){
    console.log("deleteing second image")
   await cloudinary.uploader.destroy(img2.publicId)
  }
  
  if(img3?.publicId !== newImages[2]?.publicId && img3?.publicId){
    console.log("deleteing third image")
   await cloudinary.uploader.destroy(img3.publicId)
  }

  if(img4?.publicId !== newImages[3]?.publicId && img4?.publicId){
    console.log('deleting fourth image')
   await cloudinary.uploader.destroy(img4.publicId)
  }

  console.log("image deleted",img1,img2,img3,img4);

  
 
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

for(let i = 0; i < length; i++){
  console.log(imageObj[`${i}`])
  let newKey = `${imageObj[`${i}`].fieldname}`
  imageObj[newKey] = imageObj[`${i}`]
  console.log(imageObj)
}

  
  imgObj[`img1${index}`] = imageObj[`img1${index}`]?.filename
  imgObj[`url1${index}`] = imageObj[`img1${index}`]?.path

  imgObj[`img2${index}`] = imageObj[`img2${index}`]?.filename
  imgObj[`url2${index}`] = imageObj[`img2${index}`]?.path

  imgObj[`img3${index}`] = imageObj[`img3${index}`]?.filename
  imgObj[`url3${index}`] = imageObj[`img3${index}`]?.path

  imgObj[`img4${index}`] = imageObj[`img4${index}`]?.filename
  imgObj[`url4${index}`] = imageObj[`img4${index}`]?.path


 

for(let i = 0; i < objArray.length/4; i++)
{
   if(obj[`stock${i}`] < 0 ){
    throw new Error("Invalid stock");
   }
   resultArray.push({
     price: obj[`price${i}`],
     stock: obj[`stock${i}`],
     storage:obj[`storage${i}`],
     ram:obj[`ram${i}`],
     images:[{publicId:imgObj[`img1${i}`],url:imgObj[`url1${i}`]}  ,  {publicId:imgObj[`img2${i}`],url:imgObj[`url2${i}`]}  ,  {publicId:imgObj[`img3${i}`],url:imgObj[`url3${i}`]} ,  {publicId:imgObj[`img4${i}`],url:imgObj[`url4${i}`]}]   })
}


return resultArray;
}




export default {
    structureProductData,
    extractGeneralImage,
    deleteExeistingImage,
    structureProductDataForEdit
}
