
import {User as Admin} from '../Models/userSchema.js'
import {User} from '../Models/userSchema.js'
import { categoryModel } from '../Models/categorySchema.js'
import fs from 'fs'
const getAdminFromDB  = async (email)=>{
  return  await Admin.findOne({email,role:"admin"})
}
const getAllUsers = async(skip,limit,search) =>{
  let pipeline = []
  if(search) pipeline.push({$match:{email:{$regex:search,$options:"i"}}});
  pipeline.push({$match:{role:"user",deleted:false}},{$skip:skip},{$limit:limit})
  return await User.aggregate(pipeline)
  // return await User.find({role:"user",deleted:false}).skip(skip).limit(limit); //befor implementing search
}

const blockUserInDB = async(id)=>{
  return await User.findByIdAndUpdate({_id:id},{$set:{isBlocked:true}});
}

const UnBlockUserInDB = async(id)=>{
  return await User.findByIdAndUpdate({_id:id},{$set:{isBlocked:false}});
}

const deleteUser = async(id) =>{
  return await User.findByIdAndUpdate({_id:id},{$set:{deleted:true}});
}


const findActiveUsers = async (skip,limit)=>{
  return  await User.find({isBlocked:false,deleted:false}).skip(skip).limit(limit)
}

const findBlockedUsers =  async (skip,limit)=>{
  return  await User.find({isBlocked:true,deleted:false}).skip(skip).limit(limit)
}

const addCategorInDB = async (categoryName,publicId,url) =>{
  const imageObj = {publicId,url}
  return await categoryModel.insertOne({categoryName,thumbnail:imageObj,createdAt:Date.now(),isBlocked:false})
  
}

const blockCategoryFromDB = async(_id,blockOrActive)=>
{
   
   await categoryModel.findByIdAndUpdate({_id},{$set:{isBlocked:blockOrActive}})

}
const getCategoryFromDB = async(_id)=>
{

 
     return await categoryModel.findOne({_id})

 
}

const getCategories = async (skip,limit,search)=>{
  let pipeline = []
  if(search){
    pipeline.push({$match:{categoryName:{$regex:search,$options:"i"}}});
  }

  pipeline.push({
    $lookup:{
      from:"offers",
      let:{targetId:'$_id'},
      pipeline:[{
        $match:{
          $expr:{
            $and:[
              {$eq:['$targetId','$$targetId']},
              {$eq:["$isActive",true]}
            ]
          }}
      }],
      as:"offer"
    }
  }
)
  
  pipeline.push({$skip:skip})
  pipeline.push({$limit:limit});
  return categoryModel.aggregate(pipeline)
  // return await categoryModel.find().skip(skip).limit(limit);
}

const getCategoriesForProductEdit = async ()=>{
  return await categoryModel.find({isBlocked:false})
}

const getAllCategoriesCount = async ()=>{
  return await categoryModel.countDocuments();
}
const updateCategory = async (_id,name=null,url=null,publicId=null)=>{

   if(publicId){
    await categoryModel.findOneAndUpdate({_id},{$set:{thumbnail:{url:url,publicId:publicId}}})
   };
   if(name)await categoryModel.findOneAndUpdate({_id},{$set:{categoryName:name}});
}

const getAllUsersCount = async ()=>{
     return await User.countDocuments()
}



export default {
    getAdminFromDB,
    getAllUsers,
    blockUserInDB,
    UnBlockUserInDB,
    deleteUser,
    findActiveUsers,
    findBlockedUsers,
    addCategorInDB,
    getCategories,
     getCategoriesForProductEdit,
    blockCategoryFromDB,
    getCategoryFromDB,
    updateCategory,
    getAllUsersCount,
    getAllCategoriesCount
}