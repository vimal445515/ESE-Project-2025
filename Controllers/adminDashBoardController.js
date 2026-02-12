import adminDashbordService from "../Service/adminDashbordService.js";

const loadAdminDashboard = async(req,res)=>{
  try{
  const selectedType = req.query?.type||'Category';
  const filter = req.query?.filter||'Monthly'
   if(req.query.type){
  
   try{
    const data =  await adminDashbordService.analyseDashbordData(selectedType,filter)
   return res.status(200).json({type:'success',data})
   }catch(error){
    return res.status(500).json({type:'error',message:'Internal server error'});
   }
  }
  const data =  await adminDashbordService.analyseDashbordData(selectedType,filter)
  console.log(data)
 
  res.status(200).render('Admin/dashboard',{data});
  }catch(error){
    console.log(error)
    res.status(500).redirect('/500Error');
  }
}


export default {
    loadAdminDashboard
}