import walletService from "../Service/walletService.js"

const loadWalletPage = async(req,res)=>{
    const  wallet = await walletService.getWallet(req.session._id)
    res.render('User/wallet',{userName:req.session.userName,profile:req.session.profile,wallet})
}

export default {
    loadWalletPage
}