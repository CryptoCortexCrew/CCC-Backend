require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const requestLogger = require("./src/middleware/requestLogger");

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/inquiry", require("./routes/inquiry.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// Serve admin static pages
app.use("/admin", express.static(path.join(__dirname, "public", "admin")));
// Admin inquiries API
app.use("/api/admin/inquiries", require("./routes/admin.inquiries.routes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
