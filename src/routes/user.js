const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../utils/authMiddleware");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const os = require("os");
const ogs = require("open-graph-scraper");

// Define uploads directory based on environment
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/uploads'  // Render.com persistent disk path
  : path.join(__dirname, '..', 'uploads'); // Local development path

// Ensure uploads directory exists
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory at:', uploadsDir);
  }
} catch (err) {
  console.error('❌ Error creating uploads directory:', err);
  // Fallback to a temporary directory if the main one fails
  const tempUploadsDir = path.join(os.tmpdir(), 'magic_card_uploads');
  if (!fs.existsSync(tempUploadsDir)) {
    fs.mkdirSync(tempUploadsDir, { recursive: true });
  }
  console.log('⚠️ Using temporary uploads directory:', tempUploadsDir);
}

// Use disk storage for uploads with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Secret key (ideally store in .env)
const { secretkey } = require("../configuration/jwtConfig");

// ✅ REGISTER a new user
router.post("/register", async (req, res) => {
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
router.get("/:id", async (req, res) => {
  try {
    // Special case for /me route - should never reach here because of middleware
    if (req.params.id === 'me') {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      header: user.header,
      highlights: user.highlights,
      backgroundPhoto: user.backgroundPhoto,
      pages: user.pages,
      activePageId: user.activePageId,
      themeColor: user.themeColor,
      template: user.template
    });
    
  } catch (err) {
    console.error("Error fetching public profile:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ✅ SETUP ROUTE
router.post("/setup", authenticateToken, upload.single('backgroundPhoto'), async (req, res) => {
  try {
    console.log("🔥 req.body:", req.body);
    console.log("🔥 req.file:", req.file);

    const {
      name,
      email,
      themeColor,
      header,
      highlights,
      pages,
      blocksList,
      activePageId,
      backgroundPhotoUrl
    } = req.body;

    console.log("🔍 name:", name);
    console.log("🔍 header:", header);
    console.log("🔍 highlights (raw):", highlights);
    console.log("🔍 pages (raw):", pages);

    // Safely parse JSON data with error handling
    let parsedHighlights;
    let parsedPages;

    try {
      parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
    } catch (err) {
      console.error("Failed to parse highlights:", err);
      return res.status(400).json({ message: "Invalid highlights format" });
    }

    try {
      parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
    } catch (err) {
      console.error("Failed to parse pages:", err);
      return res.status(400).json({ message: "Invalid pages format" });
    }

    const update = {
      name,
      header: Array.isArray(header) ? header : (header ? [header] : []),
      highlights: parsedHighlights,
      pages: parsedPages.pages || parsedPages,
      activePageId: parsedPages.activePageId || activePageId,
      themeColor: themeColor || '#b3a369'
    };

    // Only set backgroundPhoto if file and filename are defined
    if (req.file && req.file.filename) {
      update.backgroundPhoto = `${process.env.BASE_URL || 'http://localhost:2000'}/uploads/${req.file.filename}`;
    } else if (backgroundPhotoUrl) {
      update.backgroundPhoto = backgroundPhotoUrl;
    }

    // Get user ID from the token payload
    const userId = req.user.id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user fields
    Object.assign(user, update);

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        header: user.header,
        highlights: user.highlights,
        backgroundPhoto: user.backgroundPhoto,
        pages: user.pages,
        activePageId: user.activePageId,
        themeColor: user.themeColor,
        template: user.template
      }
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Server error during profile update", error: err.message });
  }
});

router.get("/link-preview", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: "Missing URL" });

  try {
    const { result } = await ogs({ url });

    let imageUrl = "";

    if (Array.isArray(result.ogImage)) {
      imageUrl = result.ogImage[0]?.url || "";
    } else if (typeof result.ogImage === "object") {
      imageUrl = result.ogImage.url || "";
    }

    return res.json({
      title: result.ogTitle || "No title",
      description: result.ogDescription || "",
      image: imageUrl,
      url: result.requestUrl || url,
    });
  } catch (err) {
    console.error("Link preview error:", err.message);
    res.status(500).json({ message: "Failed to fetch preview" });
  }
});

router.post("/generate-profile", async (req, res) => {
const { resumeText } = req.body;
if (!resumeText) return res.status(400).json({ message: "Missing resume text" });

try {
  const openaiResponse = await openai.chat.completions.create({
    model: "gpt-4o", // Use GPT-4o for longer outputs
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `You are a smart resume parser. Given a user's resume, return a complete and detailed JSON object that fits the following format: 
{
  name: string,
  email: string,
  highlights: [{label: string, category: string}],
  pages: [
    {id: string, name: string, blocks: [{id, type, content}]}
  ],
  activePageId: string
}
Use categories like Academic, Technical, Leadership, Extracurricular, Personal Development. Include full education, work experience, projects, leadership, and skills as structured blocks. Use 'text', 'link', 'code', 'contactsText', and 'multiBlock' types wherever possible.`
      },
      {
        role: "user",
        content: resumeText
      }
    ]
  });

  const jsonResult = openaiResponse.choices?.[0]?.message?.content;

  // You may want to validate/sanitize this output before saving
  const parsed = JSON.parse(jsonResult);
  res.json(parsed);
} catch (err) {
  console.error("❌ GPT Error:", err.message);
  res.status(500).json({ message: "Failed to generate profile" });
}
});

const { default: ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");

const token = process.env["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"]; // Make sure this is set in .env
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

// Add this near the other routes in routes/user.js

router.post("/onboarding", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const { template, themeColor, skipOnboarding } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save onboarding preferences
    user.template = template || user.template;
    user.themeColor = themeColor || user.themeColor;
    user.onboarding = !!skipOnboarding;

    await user.save();

    res.status(200).json({ message: "Onboarding preferences saved." });
  } catch (err) {
    console.error("Onboarding save error:", err);
    res.status(500).json({ message: "Server error saving onboarding preferences" });
  }
});

router.post("/generate-profile-from-resume", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ message: "Missing resume text" });
  }

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: `You are a smart resume parser. Return a JSON object with these fields:
{
  name: string,
  email: string,   // <- THIS MUST BE PRESENT
  highlights: [{label: string, category: string}], // see categories below
  pages: [...]
}

Allowed highlight categories are:
- "Academic"
- "Technical"
- "Leadership"
- "Extracurricular"
- "Personal Development"
DO NOT use categories like "Education" or "Research".`
          },
          {
            role: "user",
            content: resumeText
          }
        ]
      }
    });

    const jsonResult = response.choices?.[0]?.message?.content;

    // You may want to validate/sanitize this output before saving
    const parsed = JSON.parse(jsonResult);
    res.json(parsed);
  } catch (err) {
    console.error("❌ GPT Error:", err.message);
    res.status(500).json({ message: "Failed to generate profile" });
  }
});

// ✅ GET current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // Get user ID from the token payload
    const userId = req.user.id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      header: user.header,
      highlights: user.highlights,
      backgroundPhoto: user.backgroundPhoto,
      pages: user.pages,
      activePageId: user.activePageId,
      themeColor: user.themeColor,
      template: user.template,
      onboarding: user.onboarding
    });
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ✅ PATCH current user profile (onboarding, template, themeColor)
router.patch("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    const { onboarding, template, themeColor } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (typeof onboarding !== 'undefined') user.onboarding = onboarding;
    if (typeof template !== 'undefined') user.template = template;
    if (typeof themeColor !== 'undefined') user.themeColor = themeColor;
    await user.save();
    res.status(200).json({
      message: "User profile updated.",
      onboarding: user.onboarding,
      template: user.template,
      themeColor: user.themeColor
    });
  } catch (err) {
    console.error("PATCH /me error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

module.exports = router;