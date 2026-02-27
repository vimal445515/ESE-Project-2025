import mongoose from "mongoose";
export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL,{
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
