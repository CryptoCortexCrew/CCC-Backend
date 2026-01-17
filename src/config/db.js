import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error("MONGO_URI is not defined in environment")
    process.exit(1)
  }

  console.log("MONGO_URI present: true")

  // Use only supported options for recent mongodb/mongoose drivers.
  // Removed legacy options: useNewUrlParser, useUnifiedTopology
  const options = {
    // short timeout for faster failure detection
    serverSelectionTimeoutMS: 5000,
    // you can add other supported options here if needed, e.g. tls, tlsCAFile, replicaSet, authSource
  }

  const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES, 10) || 5
  const retryDelay = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS, 10) || 2000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt}/${maxRetries})`)
      await mongoose.connect(uri, options)
      console.log("MongoDB connected")
      return
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message || err)
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await sleep(retryDelay)
      } else {
        console.error("MongoDB connection failed after retries", err)
        console.error("Troubleshooting hints: 1) Ensure Atlas IP access list allows this host's IP; 2) Verify the connection string and credentials; 3) Allow TLS/SSL if required by Atlas; 4) Test with MongoDB Compass using the same URI.")
        process.exit(1)
      }
    }
  }
}

export default connectDB
