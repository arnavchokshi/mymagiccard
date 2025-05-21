const jwt = require("jsonwebtoken");
const { secretkey } = require("../configuration/jwtConfig");

function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");
    console.log("🛡 Authorization Header:", authHeader); // log full header
  
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: Missing token!" });
    }
  
    const [bearer, token] = authHeader.split(" ");
    console.log("🔐 Extracted token:", token);
  
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }
  
    jwt.verify(token, secretkey, (err, user) => {
      if (err) {
        console.error("❌ JWT verification error:", err);
        return res.status(403).json({ message: "Forbidden: Invalid Token" });
      }
  
      req.user = user;
      next();
    });
  }
  

function verifyToken(token) {
    return jwt.verify(token, secretkey)
}

module.exports = { authenticateToken, verifyToken };
