import adminDashbordService from "../Service/adminDashbordService.js";

const loadAdminDashboard = async(req,res)=>{

  const data =  await adminDashbordService.analyseDashbordData()
  console.log(data)
  res.status(200).render('Admin/dashboard',{data});
}

export default {
    loadAdminDashboard
}