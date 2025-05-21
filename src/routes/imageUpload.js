// routes/imageUpload.js
const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { authenticateToken } = require("../utils/authMiddleware");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'deqcdiynp',
  api_key: '293655814833983',
  api_secret: 'kBah2TKM4NZVa8ILtzR-3usQXyI'
});

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Authenticated route to upload an image
router.post("/image", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary with optimization settings
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'magic_card',
      fetch_format: 'auto',
      quality: 'auto',
      transformation: [
        { width: 1200, crop: 'limit' }, // Limit max width while maintaining aspect ratio
      ]
    });

    console.log('Cloudinary upload result:', result); // Debug log

    // Return the Cloudinary URL
    res.status(200).json({ 
      message: "Image uploaded successfully", 
      url: result.secure_url // This is the HTTPS URL of the uploaded image
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: "Failed to upload image",
      error: error.message 
    });
  }
});

module.exports = router;
