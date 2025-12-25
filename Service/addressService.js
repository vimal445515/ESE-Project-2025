
import address from '../Controllers/address.js'
import addressSchema from '../Models/addressSchema.js'
import mongoose from 'mongoose'

const storeAddress = async(data,id)=>{
    let address = {}
    address.userName = data.userName
    if(data.companyName){
    address.companyName = data.companyName
    }
    address.address = data.address
    address.pinCode = data.pinCode
    address.state = data.state
    address.city = data.city
    address.email = data.email
    address.phoneNumber = data.phoneNumber
    address.userId = id
    address.country = data.country
    address.default = true
   try{
     await addressSchema.findOneAndUpdate({userId:id,default:true},data,{upsert:true,setDefaultsOnInsert:true})
   }
   catch(error){
    return "Somthing was wrong!"
   }
}


const getUserAddress= async (_id)=>{
    
   const data = await addressSchema.findOne({userId:_id,default:true})
   return data
}

const getAllAddressForCheckout = async(_id) =>{
  const data = await addressSchema.find({userId:_id,default:false})
  return data
}

const findAddressFromDB = async(addressId)=>{
  
  return await addressSchema.findOne({_id:addressId}); 
}
export default 
{
    storeAddress,
    getUserAddress,
    getAllAddressForCheckout,
    findAddressFromDB
}