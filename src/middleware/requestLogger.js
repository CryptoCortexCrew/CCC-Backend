let logger
try {
  // Try CommonJS require first (when app runs in CJS)
  logger = require("../config/logger")
} catch (e) {
  try {
    // Try ES module default export fallback
    // eslint-disable-next-line global-require
    const mod = require("../config/logger.js")
    logger = mod && mod.default ? mod.default : mod
  } catch (err) {
    // Fallback to console
    logger = console
  }
}

module.exports = function requestLogger(req, res, next) {
  const start = Date.now()
  const { method, originalUrl } = req

  const safeBody = (() => {
    if (!req.body) return undefined
    try {
      const copy = Object.assign({}, req.body)
      if (copy.password) copy.password = "[REDACTED]"
      if (copy.token) copy.token = "[REDACTED]"
      return copy
    } catch (e) {
      return "[unserializable body]"
    }
  })()

  if (logger && typeof logger.info === "function") {
    logger.info("Incoming request", { method, url: originalUrl, body: safeBody })
  } else {
    console.log("Incoming request", method, originalUrl, safeBody)
  }

  res.on("finish", () => {
    const duration = Date.now() - start
    if (logger && typeof logger.info === "function") {
      logger.info("Request complete", {
        method,
        url: originalUrl,
        status: res.statusCode,
        duration_ms: duration,
      })
    } else {
      console.log("Request complete", method, originalUrl, res.statusCode, `${duration}ms`)
    }
  })

  next()
}
