/**
 * middleware/auth.js — JWT authentication middleware
 * Attach this to any route that requires a logged-in user.
 * On success it sets req.user = { id, email, name }.
 */

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Accept token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // { id, email, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authenticate;
