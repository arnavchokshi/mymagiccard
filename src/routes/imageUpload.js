// routes/imageUpload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../utils/authMiddleware");

const router = express.Router();

// Set up multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Authenticated route to upload an image
router.post("/image", authenticateToken, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  const imageUrl = `http://localhost:2000/uploads/${req.file.filename}`;
  res.status(200).json({ message: "Image uploaded", url: imageUrl });
});

module.exports = router;
