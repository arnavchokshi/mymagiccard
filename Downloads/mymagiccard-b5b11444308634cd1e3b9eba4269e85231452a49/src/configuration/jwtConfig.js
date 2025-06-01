const crypto = require("crypto");

// Use environment variable for JWT secret or fallback to a default for development
const secretkey = process.env.JWT_SECRET || "your-default-development-secret-key";

module.exports = { secretkey };