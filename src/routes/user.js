const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/user");
const authMiddleware = require("../utils/authMiddleware");
const User = require("../models/user");
const { getLinkPreview } = require("link-preview-js");

const router = express.Router();
router.use(cors());

const ogs = require("open-graph-scraper");

// Link preview route
router.get("/link-preview", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: "Missing URL" });

  try {
    const data = await getLinkPreview(url);

    res.json({
      title: data.title || "",
      description: data.description || "",
      image: data.images?.[0] || "",
      url: data.url || url
    });
  } catch (err) {
    console.error("Link preview error:", err.message);
    res.status(500).json({ message: "Failed to generate preview" });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ PUBLIC profile route
router.get("/public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email blocksGrid highlights profilePhoto");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      highlights: user.highlights,
      blocksGrid: user.blocksGrid || [],
      profilePhoto: user.profilePhoto || ""
    });
  } catch (error) {
    console.error("Public profile error:", error.message);
    res.status(500).json({ message: "Error retrieving public profile" });
  }
});

// Private route - Get all users
router.get("/users", authMiddleware.authenticateToken, userController.getUsers);

// POST /api/setup — Save full profile
router.post("/setup", authMiddleware.authenticateToken, upload.single("profilePhoto"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email } = req.body;
    const highlights = JSON.parse(req.body.highlights || "[]");
    const blocksGrid = JSON.parse(req.body.blocks || "[]");

    user.name = name;
    user.email = email;
    user.highlights = highlights;
    user.blocksGrid = blocksGrid;

    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({ message: "Profile saved", id: user._id });
  } catch (err) {
    console.error("Setup error:", err.message);
    res.status(500).json({ message: "Failed to save profile", error: err.message });
  }
});

// Block management routes
// Add a new block
router.post("/:id/blocks", async (req, res) => {
  try {
    const { type, content } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newBlock = { type, content };
    user.blocksGrid.push(newBlock);
    await user.save();

    res.status(201).json(user.blocksGrid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a block by index
router.put("/:id/blocks/:index", async (req, res) => {
  try {
    const { type, content } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = parseInt(req.params.index);
    if (index < 0 || index >= user.blocksGrid.length) {
      return res.status(400).json({ message: "Invalid block index" });
    }

    user.blocksGrid[index] = { ...user.blocksGrid[index], type, content };
    await user.save();

    res.json(user.blocksGrid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a block by index
router.delete("/:id/blocks/:index", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = parseInt(req.params.index);
    if (index < 0 || index >= user.blocksGrid.length) {
      return res.status(400).json({ message: "Invalid block index" });
    }

    user.blocksGrid.splice(index, 1);
    await user.save();

    res.json(user.blocksGrid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PDF Upload
const uploadPDF = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname)
  })
});

router.post("/upload-pdf", uploadPDF.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });

  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({ url });
});

// Save profile (alternative route)
router.post("/save-profile", authMiddleware.authenticateToken, async (req, res) => {
  try {
    console.log("🔧 Save-profile route hit");
    console.log("Request body:", req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("❌ User not found:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, highlights, blocksGrid } = req.body;

    console.log("Parsed values:", { name, email, highlights, blocksGrid });

    user.name = name;
    user.email = email;
    user.highlights = highlights;
    user.blocksGrid = blocksGrid;

    await user.save();
    console.log("✅ User profile saved");

    res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    console.error("❌ Save profile error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
