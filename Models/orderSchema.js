import mongoose from 'mongoose'


const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        requrie:true
    },
    orderId:{
        type:String,
        requrie:true
    },
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId
            },
            variantId:{
                type:mongoose.Schema.Types.ObjectId
            },
            categoryId:{
                 type:mongoose.Schema.Types.ObjectId
            },
            price:{type:Number},
            productName:{type:String},
            quantity:{type:Number},
            offerPrice:{type:Number},
            image:{type:String},
            finalPrice:{type:Number},
            status:{
                type:String,
                default:"placed"
            }
        }
    ],  
    payment:{
        method:{type:String},
        status:{type:String,default:'pending'},
        paymentOrderId:{type:String}
    },
    address:{
        userName:{type:String},
        companyName:{type:String},
        address:{type:String},
        pinCode:{type:Number},
        country:{type:String},
        state:{type:String},
        district:{type:String},
        email:{type:String},
        phoneNumber:{type:String},
        
    },
    pricing:{
        subTotal:{type:Number},
        tax:{type:Number},
        discount:{type:Number},
        offerDiscount:{type:Number},
        couponDiscount:{type:Number},
        totalAmount:{type:Number}
    },
    orderStatus:{
        default:"placed",
        type:String
    },
    createdAt:{
        type:Date,
        default:new Date()
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    coupon:{
        type:Object,
        default:null
    }
})

export default mongoose.model('order',orderSchema)