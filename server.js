require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const requestLogger = require("./src/middleware/requestLogger");

const app = express();

// DB
connectDB();

// CORS Configuration - MUST BE BEFORE ROUTES
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Accept'],
  exposedHeaders: ['x-auth-token']
}));

// Handle preflight requests - REMOVED as app.use(cors()) handles it

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (if you want to track requests)
// app.use(requestLogger);

// Routes
app.use("/api/inquiry", require("./routes/inquiry.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// Serve admin static pages
app.use("/admin", express.static(path.join(__dirname, "public", "admin")));

// Admin inquiries API
app.use("/api/admin/inquiries", require("./routes/admin.inquiries.routes"));

// Jobs and applications
app.use("/api/jobs", require("./routes/jobs.routes"));
app.use("/api/applications", require("./routes/applications.routes"));

// Serve uploaded resume files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running...",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to check if server is accessible
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    port: PORT,
    cors: "enabled"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for frontend`);
});