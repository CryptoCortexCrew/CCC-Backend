import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not defined in environment")
    } else {
      console.log("MONGO_URI present:", Boolean(process.env.MONGO_URI))
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected")
  } catch (err) {
    console.error("MongoDB connection failed", err)
    process.exit(1)
  }
}

export default connectDB
