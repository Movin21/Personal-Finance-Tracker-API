const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Check if authHeader exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No Token Found, Unauthorized" });
  }

  // Extract the token from the "Bearer <token>" format
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`USER request.user:`, req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token, Unauthorized" });
  }
};

module.exports = verifyToken;
