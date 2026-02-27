import mongoose from "mongoose";
export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000
});
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
