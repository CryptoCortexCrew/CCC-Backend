const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || req.query.token || req.body.token;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split ? authHeader.split(" ")[1] : authHeader;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    // Optionally verify admin exists
    const admin = await Admin.findById(payload.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Invalid token" });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
