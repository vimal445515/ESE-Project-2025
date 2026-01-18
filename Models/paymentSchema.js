import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number, 
      required: true
    },
    paymentOrderId:{
        type:String,
        retuired:true
    },
    currency: {
      type: String,
      default: "INR"
    },

    receipt: String,

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    signature: String,
  },
  { timestamps: true }
)

export default mongoose.model("payment",paymentSchema)