
import addressSchema from '../Models/addressSchema.js'
import mongoose from 'mongoose'

const storeAddress = async(data,id)=>{

  if(data.isNew){
  
       let address ={}
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
   try{ 
    const newData = await addressSchema.create(address)
      if(data.newDefault){
        await updateAddressAsDefault(newData._id,id);
      }
      return false
   }
   catch(error){
    console.log(error)
    return true
   }


   }else if(data.addressId){
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

   try{
     await addressSchema.findOneAndUpdate({_id:new mongoose.Types.ObjectId(data.addressId)},data,{upsert:true,setDefaultsOnInsert:true})
     false
   }
   catch(error){
    console.log(error)
    return true
   }

  }else{
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
    return false
   }
   catch(error){
     console.log(error)
    return true
   }
   }
}


const getUserAddress= async (_id)=>{
    
   const data = await addressSchema.findOne({userId:_id,default:true})
   return data
}


const updateAddressAsDefault = async(_id,userId)=>{
  
 const data =await addressSchema.findOneAndUpdate({userId:new mongoose.Types.ObjectId(userId),default:true},{$set:{default:false}});

  await addressSchema.findOneAndUpdate({_id:new mongoose.Types.ObjectId(_id)},{$set:{default:true}});
}


const getAllAddressForCheckout = async(_id) =>{
  const data = await addressSchema.find({userId:_id})
  return data
}

const findAddressFromDB = async(addressId)=>{
  
  return await addressSchema.findOne({_id:addressId}); 
}

const deleteAddressFromDB = async(addressId,userId) =>{
    if(await addressSchema.findOne({_id:addressId,default:true})){
         await addressSchema.deleteOne({_id:addressId});
      return    await addressSchema.updateOne({userId:userId},{$set:{default:true}})
    } 
   await addressSchema.deleteOne({_id:addressId});
}


export default 
{
    storeAddress,
    getUserAddress,
    getAllAddressForCheckout,
    findAddressFromDB,
    deleteAddressFromDB,
    updateAddressAsDefault
}