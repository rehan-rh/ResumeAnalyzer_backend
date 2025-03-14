const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Middleware entered");
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }
  try {
    const decoded = jwt.verify(token, "RESUME@123"); // Verify & decode token
    req.user = decoded; // Store user info in request
    console.log("Middleware passed");
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;