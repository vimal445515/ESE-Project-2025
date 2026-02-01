import walletService from "../Service/walletService.js"
import helpers from '../helpers/helpers.js'

const loadWalletPage = async(req,res)=>{
    const page = req.query?.page||1
    const limit = 10;
    const skip  = helpers.paginationSkip(page,limit)
    const  wallet = await walletService.getWallet(req.session._id,skip,limit);
    const count = await walletService.countTransaction(req.session._id)
    res.render('User/wallet',{userName:req.session.userName,profile:req.session.profile,wallet,page,count,limit})
}

export default {
    loadWalletPage
}