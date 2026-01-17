import winston from "winston"
import "winston-daily-rotate-file"

const { combine, timestamp, printf, errors } = winston.format

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`
})

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [dailyRotateTransport, new winston.transports.Console()],
})

// morgan compatibility: expose a stream with a write function
logger.stream = {
  write: (message) => {
    logger.info(message.trim())
  },
}

export default logger
