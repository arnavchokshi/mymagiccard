// routes/imageUpload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { authenticateToken } = require("../utils/authMiddleware");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Authenticated route to upload an image
router.post("/image", authenticateToken, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  
  // Use the correct URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://mymagiccard.onrender.com'
    : 'http://localhost:2000';
    
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.status(200).json({ message: "Image uploaded", url: imageUrl });
});

module.exports = router;
