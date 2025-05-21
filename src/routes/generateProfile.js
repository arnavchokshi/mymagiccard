const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateToken } = require("../utils/authMiddleware");
const mongoose = require("mongoose");

const GITHUB_API_URL = "https://models.github.ai/inference";
const MODEL = "openai/gpt-4.1";

router.post("/generate-profile", authenticateToken, async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ message: "Missing resume text" });
  }

  try {
    const response = await fetch(GITHUB_API_URL + "/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You convert resumes into structured JSON for web profiles."
          },
          {
            role: "user",
            content: prompt // Your existing prompt here
          }
        ],
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ GitHub API Error:", error);
      throw new Error(error.message || "Failed to generate profile");
    }

    const data = await response.json();
    const rawJson = data.choices?.[0]?.message?.content;
    console.log("📝 Raw GPT output:\n", rawJson);

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", rawJson);
      return res.status(500).json({ message: "Invalid output format", raw: rawJson });
    }

    if (!Array.isArray(parsed.pages)) {
      return res.status(400).json({ message: "Parsed response missing 'pages'", parsed });
    }

    const update = {
      highlights: parsed.highlights || [],
      pages: parsed.pages,
      activePageId: parsed.activePageId || parsed.pages[0]?.id || "main"
    };

    const user = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.user._id),
      { $set: update },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found for update" });
    }

    console.log("✅ Updated existing user:", user._id);

    res.status(200).json({
      message: "Profile updated successfully!",
      userId: user._id,
      previewUrl: `http://localhost:3000/user/${user._id}/edit`
    });

  } catch (err) {
    console.error("❌ Error during profile generation:", err);
    res.status(500).json({ 
      message: "Failed to generate profile",
      error: err.message || "Unknown error"
    });
  }
});

module.exports = router;