import express from "express"
import cors from "cors"
import morgan from "morgan"
import connectDB from "./config/db.js"
import contactRoutes from "./routes/contactRoutes.js"
import logger from "./config/logger.js"

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

// HTTP request logging via morgan -> winston
app.use(morgan("combined", { stream: logger.stream }))

app.use("/api", contactRoutes)

export default app
