import sendEmail from '../Service/contactService.js'

const sendMessage = (req,res)=>{
    const {email,subject,message,name} = req.body;
   if( sendEmail(email,subject,name,message)){
    res.status(200).json({type:"success",message:"Message send successfully"})
   }
   else{
    res.status(550).json({type:"error",message:"Message sending faild!"})
   }

}

export default{
    sendMessage
}