import adminDashbordService from "../Service/adminDashbordService.js";

const loadAdminDashboard = async(req,res)=>{
  const selectedType = req.query?.type||'Category';
  const filter = req.query?.filter||'Monthly'
  const data =  await adminDashbordService.analyseDashbordData(selectedType,filter)
  console.log(data)
  if(req.query.type){
   return res.status(200).json({data})
  }
  res.status(200).render('Admin/dashboard',{data});
}

export default {
    loadAdminDashboard
}