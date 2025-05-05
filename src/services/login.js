const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../utils/jwtUtils");
const { verifyToken } = require("../utils/authMiddleware")

async function login(email, password) {
  try {
    // Check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    // Generate token
    const token = generateToken(existingUser);
    return token;
  } catch (error) {
    // Log the error message correctly
    console.log("Login error: ", error.message);
    throw new Error("Invalid credentials");
  }
}

async function refreshToken(oldToken) {
    try {
        const decodedToken = verifyToken(oldToken);
        const user = await User.findById(decodedToken._id);
      
        if (!user) {
          throw new Error("User not found");
        }
      
        const newToken = generateToken(user);
        return newToken;
      } catch (error) {
        throw new Error("Invalid token");
      }      
}

module.exports = {
  login,
  refreshToken
};
