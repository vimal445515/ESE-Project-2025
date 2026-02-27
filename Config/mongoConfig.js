import mongoose from "mongoose";
export const connectDb = async () => {
  try {
    console.log(process.env.MONGODB_URL)
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
