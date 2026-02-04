import adminService from '../../Service/adminService.js'
import helpers from '../../helpers/helpers.js'
import hash from '../../helpers/passwordHash.js'
import categoryThumbnail from '../../Config/categoryThumbnail.js'
import fs from 'fs'
import categoryService from '../../Service/categoryService.js'
import cloudinary from '../../Config/cloudinary.js'
import { error } from 'console'
export const loadLoginPage=(req,res)=>{
    res.status(200).render('Admin/login',{status:"success",message:"login page loaded successfully"})
}

export const authentication = async (req,res)=>{
   const {email,password} = req.body
   console.log(email,password)
   const  data =  await adminService.getAdminFromDB(email);
   console.log(data);
   if(!data) {
    req.flash('error',"Admin not found",error)
    return res.status(401).redirect('/admin/login')
   }
   if(data.role !== "admin"){
    req.flash('error',"Sorry access denieted You are not Admin")
    return res.status(401).redirect('/admin/login')
   } 
   if(hash.comparePassword(password,data.password))
   {
    req.session.adminName = data.userName;
    req.session.adminRole = data.role;
    res.status(200).redirect("/admin/home")
   }
   else
   {
    req.flash('error',"invalid password",'error')
    res.status(400).redirect('/admin/login')
   }
   
}
export const logout = (req,res)=>{
 if(req.session.role == 'user'){
     req.session.adminName = null;
    req.session.adminRole = null;
    res.status(200).redirect('/admin/login')
 }else
 {    
     req?.session.destroy((err)=>{
    if(err) throw new Error("erorr in sesion distroy");
    res.status(200).redirect('/admin/login')
  })
 }
}
export const blockUser = async(req,res)=>{
      await adminService.blockUserInDB(req.params.id)
     res.redirect('/admin/user')
}

export const unBlockUser = async (req,res)=>{
    console.log("heloog")
   await adminService.UnBlockUserInDB(req.params.id)
    res.redirect('/admin/user')
}

export const deleteUser = async (req,res)=>{
    await adminService.deleteUser(req.params.id);
    res.redirect('/admin/user')
}

export const ActiveUsers = async(req,res)=>{
   
    const page = req.query.page||1;
    const limit = 8;
    const skip =  helpers.paginationSkip(page,limit)
    const data = await adminService.findActiveUsers(skip,limit)
    const count = await adminService.getAllUsersCount();
    
    res.render('admin/userManage',{data,page,limit,count,search:null})
}
export const blockedUsers = async (req,res)=>{

     const page = req.query.page||1;
    const limit = 8;
    const skip =  helpers.paginationSkip(page,limit)
    const data = await adminService.findBlockedUsers(skip,limit);
    const count = await adminService.getAllUsersCount();
    res.render('admin/userManage',{data,page,limit,count,search:null});
}

export const LoadAddCategoriesPage =(req,res)=>{
    res.render("Admin/addCategory",{status:null,message:null})
}
export const loadEditCategoriesPage = async (req,res) => {
    const data = await adminService.getCategoryFromDB(req.params.id)
    return res.render("Admin/editCategory",{data,status:"null",message:"null"})
}

export const loadAddProductPage = async (req,res)=>{
     const categorys  = await adminService.getCategoriesForProductEdit()
    res.render("Admin/addProduct",{categorys,status:"null",message:"null"})
}





export const loadUserManagementPage = async(req,res) =>{
    const page = req.query.page||1;
    const search = req.query.search;
    const limit = 8;
    const skip =  helpers.paginationSkip(page,limit)
    const data = await adminService.getAllUsers(skip,limit,search)
    const count = await adminService.getAllUsersCount();
    res.render('admin/userManage',{data,page,limit,count,search})
}

export const handleImage = (req,res,next)=>{
    categoryThumbnail.single("image")(req,res,(error)=>{
    if(error?.code==="LIMIT_FILE_SIZE"){
        return res.status(400).json({type:'error',message:"File have a limit 2MB"})
       
    }
    if( error?.message?.includes("Invalid image") ||error?.message?.includes("Format") || error?.message?.includes("allowed")){
        return res.status(400).json({type:'error',message:"Only image file are allowed"})
    }
    next()
})
}

export const saveCategoryData =async (req,res)=>{
    try{
    if(!req.file) return res.status(400).json({type:"error",message:'image Required'});
    const publicId = req.file.filename
    const url = req.file.path
    if( await categoryService.findCategoryByName(req.body.categoryName)) {
         await cloudinary.uploader.destroy(req.file.filename)
        return res.status(401).json({type:'error',message:"Category already exists"});
    }
    await adminService.addCategorInDB(req.body.categoryName,publicId,url)
    res.status(200).json({type:"success",href:'/admin/categories'})
    }catch(error){
        console.log(error);
        res.status(500).json({type:'error',message:"Connection failed"})
    }
}

export const loadCategoriePage =  async (req,res) =>{
    const page = req.query.page||1
    const search = req.query.search
    const limit = 18;
    const skip = helpers.paginationSkip(page,limit)
    const data = await adminService.getCategories(skip,limit,search)
    const count = await adminService.getAllCategoriesCount()
    res.render('admin/categories',{data,page,limit,count});
}

export const blockCategory = async (req,res,next)=>{
    
    const id = req.params.id;
    const isBlocked = req.params.isBlocked
    await adminService.blockCategoryFromDB(id,isBlocked)
 next()
}


export const editCategory = async (req,res)=>{
    try{
    const data = await adminService.getCategoryFromDB({_id:req.params.id})
    
    if( await categoryService.findCategoryByName(req.body.categoryName,data._id)){
        if(req?.file){
           await cloudinary.uploader.destroy(req.file.filename)
        }
       return res.status(409).json({type:"error",message:"category already exists"})
       
         
    };
   
    const url = req.file?req.file.path :data.thumbnail.url;
    const publicId = req.file?req.file.filename:data.thumbnail.publicId;
    if( req?.file)
    { 
      await cloudinary.uploader.destroy(data.thumbnail.publicId)
    }
    adminService.updateCategory(req.params.id,req.body.categoryName,url,publicId)
    return res.status(200).json({type:'success',href:'/admin/categories'})
}catch(error){
 console.log(error);
 return res.status(500).json({type:'error',message:"Something was wrong"})
}
}

