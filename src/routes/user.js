const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../utils/authMiddleware");
const multer = require("multer");
const upload = multer(); // memory storage



// Secret key (ideally store in .env)
const { secretkey } = require("../configuration/jwtConfig");


// ✅ REGISTER a new user
router.post("/user/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      highlights: [],
      pages: [],
      activePageId: "main"
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, secretkey, { expiresIn: "2h" });
    res.status(201).json({ message: "User registered successfully.", token });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ PUBLIC PROFILE ROUTE
router.get("/api/public/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        name: user.name,
        email: user.email,
        highlights: user.highlights,
        profilePhoto: user.profilePhoto,
        pages: user.pages,
        activePageId: user.activePageId
      });
      
    } catch (err) {
      console.error("Error fetching public profile:", err);
      res.status(500).json({ message: "Server error fetching profile" });
    }
  });

  
  // 👇 THIS is the public profile route
  router.get("/public/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        name: user.name,
        email: user.email,
        highlights: user.highlights,
        profilePhoto: user.profilePhoto,
        pages: user.pages,
        activePageId: user.activePageId
      });
    } catch (err) {
      console.error("Error in GET /public/:id:", err);
      res.status(500).json({ message: "Server error fetching profile" });
    }
  });



  router.post("/setup", authenticateToken, upload.none(), async (req, res) => {
    try {
      console.log("🔥 req.body:", req.body);
  
      const {
        name,
        email,
        highlights,
        pages,
        blocksList,
        activePageId,
        profilePhotoUrl
      } = req.body;
  
      console.log("🔍 name:", name);
      console.log("🔍 highlights (raw):", highlights);
      console.log("🔍 pages (raw):", pages);
  
      const parsedPages = JSON.parse(pages); // likely crash here
  
      const update = {
        name,
        email,
        highlights: JSON.parse(highlights),
        pages: parsedPages.pages,
        activePageId: parsedPages.activePageId
      };
  
      if (profilePhotoUrl) update.profilePhoto = profilePhotoUrl;
  
      const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = update.name;
    user.email = update.email;
    user.highlights = update.highlights;
    user.pages = update.pages;
    user.activePageId = update.activePageId;
    if (update.profilePhoto) user.profilePhoto = update.profilePhoto;

    await user.save();  // ✅ ensures Mongoose uses schema correctly

  
      res.status(200).json({ message: "Profile updated successfully." });
    } catch (err) {
      console.error("❌ Profile update error:", err);
      res.status(500).json({ message: "Server error during profile update" });
    }
  });
  
  
  
  

  
module.exports = router;
