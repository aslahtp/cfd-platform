import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to MongoDB");
  return mongoose.connection;
}
