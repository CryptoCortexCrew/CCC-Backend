import express from "express"
import cors from "cors"
import morgan from "morgan"
import connectDB from "./config/db.js"
import contactRoutes from "./routes/contactRoutes.js"
import logger from "./config/logger.js

const app = express()

connectDB()


app.use(cors())
app.use(express.json())

// Detailed request logging middleware (logs request and response summary)
app.use(requestLogger)

// HTTP request logging via morgan -> winston
app.use(morgan("combined", { stream: logger.stream }))

app.use("/api", contactRoutes)

// Root health-check / status route
app.get("/", (req, res) => {
	const payload = {
		status: "ok",
		message: "Everything is running perfectly",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		env: process.env.NODE_ENV || "development",
	}

	logger.info("Health check", payload)
	res.status(200).json(payload)
})

export default app
