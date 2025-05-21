const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../utils/authMiddleware");
const multer = require("multer");
// Use disk storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });
const ogs = require("open-graph-scraper");
const path = require("path");

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
router.get("/public/:id", async (req, res) => {
  try {
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
      activePageId: user.activePageId
    });
    
  } catch (err) {
    console.error("Error fetching public profile:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

router.post("/setup", authenticateToken, upload.single('backgroundPhoto'), async (req, res) => {
  try {
    console.log("🔥 req.body:", req.body);
    console.log("🔥 req.file:", req.file);

    const {
      name,
      email,
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

    const parsedPages = JSON.parse(pages); // likely crash here

    const update = {
      name,
      email,
      header,
      highlights: JSON.parse(highlights),
      pages: parsedPages.pages,
      activePageId: parsedPages.activePageId
    };

    // Only set backgroundPhoto if file and filename are defined
    if (req.file && req.file.filename) {
      update.backgroundPhoto = `http://localhost:2000/uploads/${req.file.filename}`;
    } else if (backgroundPhotoUrl) {
      update.backgroundPhoto = backgroundPhotoUrl;
    }

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = update.name;
    user.email = update.email;
    user.header = update.header;
    user.highlights = update.highlights;
    user.pages = update.pages;
    user.activePageId = update.activePageId;
    if (update.backgroundPhoto) user.backgroundPhoto = update.backgroundPhoto;

    await user.save();  // ✅ ensures Mongoose uses schema correctly

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        header: user.header,
        highlights: user.highlights,
        backgroundPhoto: user.backgroundPhoto,
        pages: user.pages,
        activePageId: user.activePageId
      }
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Server error during profile update" });
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
          { role: "user", content: resumeText }
        ],
        temperature: 0.4,
        top_p: 1,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const result = response.body.choices[0].message.content;

    try {
      const json = JSON.parse(result); // validate it's actual JSON
      res.json(json);
    } catch (err) {
      console.error("⚠️ GPT response not valid JSON:", result);
      res.status(500).json({ message: "Failed to parse GPT response", raw: result });
    }

  } catch (err) {
    console.error("❌ Error calling Azure GPT:", err);
    res.status(500).json({ message: "Azure GPT error", error: err });
  }
});

// ✅ GET current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.name,
      email: user.email,
      header: user.header,
      highlights: user.highlights,
      backgroundPhoto: user.backgroundPhoto,
      pages: user.pages,
      activePageId: user.activePageId
    });
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;
