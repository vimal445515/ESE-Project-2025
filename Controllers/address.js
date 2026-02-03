import addressService from '../Service/addressService.js'
const address = async (req,res)=>{
 try{
 let  error  = await addressService.storeAddress(req.body,req.session._id);
  if(error){
    console.log(error)
   return res.status(500).json({type:'error',message:"Connection faild"})
  
  }
 
 return res.status(200).json({type:'success',href:'/address'})

}catch(error){
   console.log(error)
    return res.status(500).json({type:'error',message:"Connection faild"})
}
}


const loadAddressPage = async(req,res)=>{
 
    let data = await addressService.getUserAddress(req.session._id);
    let allAddress = await addressService.getAllAddressForCheckout(req.session._id);
    data = data||null
    if(allAddress.length ===0) allAddress = null;
    res.render('User/address',{userName:req.session.userName,profile:req.session.profile,data,allAddress})
}


const loadSelectedAddress = async(req,res)=>{
  let data = await addressService.findAddressFromDB(req.params.id)
  res.status(200).json(data);
}

const deleteAddress = async (req,res)=>{
     
     await addressService.deleteAddressFromDB(req.body.addressId,req.session._id)
     res.status(200).json({message:"address Deleted successfully"});
}


export default
{
address,
loadAddressPage,
loadSelectedAddress,
deleteAddress
}