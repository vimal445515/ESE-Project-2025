const loadAdminDashboard = (req,res)=>{
  res.status(200).render('Admin/dashboard');
}

export default {
    loadAdminDashboard
}