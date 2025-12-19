import adminService from '../../Service/adminService.js'
import helpers from '../../helpers/helpers.js'
import hash from '../../helpers/passwordHash.js'
import categoryThumbnail from '../../Config/categoryThumbnail.js'
import fs from 'fs'
import categoryService from '../../Service/categoryService.js'
export const loadLoginPage=(req,res)=>{
    res.status(200).render('Admin/login',{status:"success",message:"login page loaded successfully"})
}

export const authentication = async (req,res)=>{
   const {email,password} = req.body
   const  data =  await adminService.getAdminFromDB(email);
   if(!data) return res.status(401).render('admin/login',{status:"error",message:"Admin not found"})
   if(!data||data.role != "admin") return res.status(401).render('admin/login',{status:"error",message:"Sorry access denieted You are not Admin"})
   if(hash.comparePassword(password,data.password))
   {
    req.session.adminName = data.userName;
    req.session.adminRole = data.role;
    res.status(200).redirect("/admin/home")
   }
   else
   {
    res.status(400).render('admin/login',{status:"error",message:"invalid password"})
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
    
    res.render('admin/userManage',{data,page,limit,count})
}
export const blockedUsers = async (req,res)=>{

     const page = req.query.page||1;
    const limit = 8;
    const skip =  helpers.paginationSkip(page,limit)
    const data = await adminService.findBlockedUsers(skip,limit);
    const count = await adminService.getAllUsersCount();
    res.render('admin/userManage',{data,page,limit,count});
}

export const LoadAddCategoriesPage =(req,res)=>{
    res.render("Admin/addCategory",{status:null,message:null})
}
export const loadEditCategoriesPage = async (req,res) => {
    const data = await adminService.getCategoryFromDB(req.params.id)
    res.render("Admin/editCategory",{data,status:"null",message:"null"})
}

export const loadAddProductPage = async (req,res)=>{
     const categorys  = await adminService.getCategories()
    res.render("Admin/addProduct",{categorys,status:"null",message:"null"})
}





export const loadUserManagementPage = async(req,res) =>{
    const page = req.query.page||1;
    const search = req.query.search;
    const limit = 8;
    const skip =  helpers.paginationSkip(page,limit)
    const data = await adminService.getAllUsers(skip,limit,search)
    const count = await adminService.getAllUsersCount();
    res.render('admin/userManage',{data,page,limit,count})
}

export const handleImage = (req,res,next)=>{
    categoryThumbnail.single("image")(req,res,(error)=>{
    if(error?.code==="LIMIT_FILE_SIZE"){
        return res.status(400).render("Admin/addCategory",{status:"error",message:"File have a limit 2MB"})
    }
    if(error?.message ==='only image file are allowed'){
        return res.status(400).render("Admin/addCategory",{status:"error",message:"Only image file are allowed"});
    }
    next()
})
}

export const saveCategoryData =async (req,res)=>{
    if(!req.file) res.status(400).render("Admin/addCategory",{status:"error",message:"invalid image upload"})
    const imgPath = '/upload/'+req.file.filename
    if( await categoryService.findCategoryByName(req.body.categoryName)) return res.status(401).render("Admin/addCategory",{status:"error",message:"category already exists"});
    adminService.addCategorInDB(req.body.categoryName,imgPath)
    res.redirect('/admin/categories')
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

export const handleEditImage = (req,res,next)=>{
    console.log(req.file)
    categoryThumbnail.single("image")(req,res, async(error)=>{

        if(error?.code==="LIMIT_FILE_SIZE"){
            
            const isFetch = req.headers["content-type"]?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest";
            if(isFetch){
                return res.status(400).json('File size is only allowed 2MP')
            }
                const parts = req.originalUrl.split("/");
                const root = parts[2];
                if(root ==="category"){
                    const id = req.params.id
               const data = await adminService.getCategoryFromDB(id)
               return  res.status(400).render('Admin/editCategory',{data,status:"error",message:"File size is only allowed 2MP"})
                }
                
        
    }
    if(error?.message ==='only image file are allowed'){
        return res.status(400).json(error.message);
    }
      next()
    })

}
export const editCategory = async (req,res)=>{
    const data = await adminService.getCategoryFromDB({_id:req.params.id})
    const imagePath = req.file?.filename?'/upload/'+req.file.filename :data.thumbnail
    if( req.file?.filename)
    { console.log(data.thumbnail)
        fs.unlink(`./public/${data.thumbnail}`,(error)=>console.log(error));
       
    }
    adminService.updateCategory(req.params.id,req.body.categoryName,imagePath)
    return res.redirect('/admin/categories')
}

