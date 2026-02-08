import wishlistService from "../Service/wishlistService.js"
const loadWishListPage= async(req,res)=>{
      const data  = await wishlistService.getWishlistItems(req.session._id)
      console.log(data)
      if(data){
        res.render('User/wishlist',{userName:req.session.userName,profile:req.session.profile,data,noData:false})
      }
      else{
        res.render('User/wishlist',{userName:req.session.userName,profile:req.session.profile,data:null,noData:true})
      }
     
    }

const storeWishlistData = async(req,res)=>{
   const url =  req.headers?.referer?.split('/')?.pop()?.trim()
   if(url === 'products'){
    try{
     await wishlistService.storeWishlistItemInDB(req.body.productId,req.body.variantId,req.session._id);
    return  res.status(200).json({data:"success"});
     }catch(error){
      res.status(500).json({type:"error",message:"Internal server error"});
     }
   }
    await wishlistService.storeWishlistItemInDB(req.body.productId,req.body.variantId,req.session._id);
    res.redirect('/wishlist');
}

const deleteWislistItem = async(req,res) =>{  
  try{
    
    await wishlistService.remove(req.body._id);
    res.status(200).json({data:"success"});
    }catch(error){
      console.log(error)
      res.status(500).json({type:"error",message:"Internal server error"});
    }
}

const unlike = async(req,res)=>{
  try{
    
  await wishlistService.removeWishlistItem(req.body.productId,req.body.variantId,req.session._id)
  res.status(200).json({data:"success"});

    }catch(error){
      console.log(error)
      res.status(500).json({type:"error",message:"Internal server error"});
    }
}

export default{
    loadWishListPage,
    storeWishlistData,
    deleteWislistItem,
    unlike
}