import wishlistService from "../Service/wishlistService.js"
const loadWishListPage= async(req,res)=>{
      const data  = await wishlistService.getWishlistItems(req.session._id)
      if(data){
        res.render('User/wishlist',{userName:req.session.userName,profile:req.session.profile,data,noData:false})
      }
      else{
        res.render('User/wishlist',{userName:req.session.userName,profile:req.session.profile,data:null,noData:true})
      }
     
    }

const storeWishlistData = async(req,res)=>{
    await wishlistService.storeWishlistItemInDB(req.body.productId,req.body.variantId,req.session._id);
    res.redirect('/wishlist');
}

const deleteWislistItem = async(req,res) =>{  
    await wishlistService.remove(req.body._id);
    res.status(200).json({data:"success"});
}

export default{
    loadWishListPage,
    storeWishlistData,
    deleteWislistItem
}