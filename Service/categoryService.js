import { categoryModel } from "../Models/categorySchema.js";
import mongoose from "mongoose"
const findCategoryByName = async (name)=>{
    let inputName = name.toLowerCase()
    let  dBNames = await categoryModel.find({},{categoryName:1,_id:0});
    
    for(let categoryObj of dBNames)
    {
        if(categoryObj.categoryName.toLowerCase() === inputName)
        {
          
           return true
        }
    }
    return  false
}

const isBlocked = async (categoryId) =>{
    const data = await categoryModel.find({_id:categoryId});
    console.log("working this category",data,categoryId)
    return data[0].isBlocked;
}

const getAllCategory = async()=>{
    const category  = await categoryModel.find({isBlocked:false},{categoryName:1,_id:0})
    return category
}



export default {
    findCategoryByName,
    getAllCategory,
    isBlocked 
}