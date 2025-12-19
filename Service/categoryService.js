import { categoryModel } from "../Models/categorySchema.js";
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

export default {
    findCategoryByName
}