import addressService from '../Service/addressService.js'
const address = async (req,res)=>{
 let  error  = await addressService.storeAddress(req.body,req.session._id);
  if(error){
    res.render('User/address',{userName:req.session.userName,profile:req.session.profile})
  }
  res.status(200).redirect('/address');
  
}

const loadAddressPage = async(req,res)=>{
   
    let data = await addressService.getUserAddress(req.session._id);
    data = data||null
    res.render('User/address',{userName:req.session.userName,profile:req.session.profile,data})
}

export default
{
address,
loadAddressPage
}