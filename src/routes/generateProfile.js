const express = require("express");
const router = express.Router();
const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { authenticateToken } = require("../utils/authMiddleware");
const mongoose = require("mongoose");

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";
const token = process.env.AZURE_GITHUB_KEY;

if (!token) {
  console.warn("⚠️ Missing AZURE_GITHUB_KEY in environment variables");
}

const client = ModelClient(endpoint, new AzureKeyCredential(token));

router.post("/generate-profile", authenticateToken, async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ message: "Missing resume text" });
  }

  try {
    const prompt = `
You are an AI agent that converts raw resume text into a full JSON user object for a portfolio website. The resulting object must follow this exact format, compatible with a MongoDB schema. Do not wrap the result in triple backticks or return plain text — only return a single clean JSON object.

✅ GENERAL OBJECT STRUCTURE:

{
  "email": "user@example.com",
  "name": "Full Name",
  "highlights": [HighlightSchema...],
  "pages": [PageSchema...],
  "activePageId": "page-001"
}

✅ HIGHLIGHTS FORMAT:
"highlights": [
  {
    "label": "UX Researcher",
    "category": "Academic" // one of: "Academic", "Professional", "Personal Development", "Extracurricular", "Technical"
  },
  ...
]

✅ PAGES FORMAT:
"pages": [
  {
    "id": "page-001",
    "name": "About",
    "blocks": [BlockSchema...]
  },
  ...
]

✅ BLOCKS FORMAT:
Each block must include:
- "id": a unique ID like "block-001" or "block-<timestamp>-randomstring"
- "type": one of:
  - "text"
  - "title"
  - "link"
  - "youtube"
  - "image"
  - "code"
  - "flip"
  - "multiBlock"
  - "contactsText"

📦 BLOCK CONTENT FORMATS:

- "text":
  {
    "title": "Section Title",
    "body": "Paragraph or bullet point content"
  }

- "title":
  {
    "title": "Big Heading",
    "subtitle": "Smaller subtitle"
  }

- "link":
  {
    "url": "https://example.com",
    "title": "Link Title",
    "description": "Short description of the linked content"
  }

- "youtube":
  {
    "url": "https://www.youtube.com/watch?v=xxxx"
  }

- "image":
  {
    "imageUrl": "https://cdn.example.com/image.jpg",
    "caption": "Short caption"
  }

- "code":
  {
    "language": "python",
    "code": "print('Hello, world!')"
  }

- "flip":
  {
    "frontSide": {
      "imageUrl": "https://example.com/image.jpg",
      "title": "Front Title",
      "subtitle": "Front Subtitle"
    },
    "backSide": {
      "text": "Back of the card text"
    }
  }

- "contactsText":
  [
    { "label": "Email", "value": "user@example.com" },
    { "label": "LinkedIn", "value": "https://linkedin.com/in/example" },
    ...
  ]

- "multiBlock":
  "content": [
    { "type": "text", "content": { ... } },
    { "type": "image", "content": { ... } },
    ...
  ]

💡 STYLE & COMPLETENESS INSTRUCTIONS:

- Use only 3/4 pages** with diverse names like "About", "Experience", "Projects", "Skills", "Education", "Leadership", etc.
- Each page should contain **at least 3–6 blocks**
- Use **all block types** at least once across all pages
- Fill out content thoroughly — include projects, certifications, companies, tools, achievements, etc.
- Use real or realistic data (e.g., GitHub links, school names, tools like React or TensorFlow)
- Visuals (images, YouTube, etc.) should be meaningful and diverse
- Avoid empty strings. Prefer imageUrl https://... over ""
- Do **not** wrap your response in Markdown, backticks, or quotes
- Ensure the entire result is a **valid JavaScript object**
- Use multiblocks to connect text to relavant images

📄 INPUT RESUME:
${resumeText}
`;



console.log("🧠 Sending prompt to GPT...");
console.log("🔍 req.user payload from token:", req.user);


const response = await client.path("/chat/completions").post({
  body: {
    messages: [
      { role: "system", content: "You convert resumes into structured JSON for web profiles." },
      { role: "user", content: prompt }
    ],
    temperature: 0.6,
    model
  }
});

if (isUnexpected(response)) {
  console.error("❌ Unexpected response from Azure API:", response.body);
  throw response.body.error;
}

const rawJson = response.body.choices?.[0]?.message?.content;
console.log("📝 Raw GPT output:\n", rawJson);

let parsed;
try {
  parsed = JSON.parse(rawJson);
} catch (err) {
  console.error("❌ Failed to parse JSON:", rawJson);
  return res.status(500).json({ message: "Invalid GPT output format", raw: rawJson });
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
res.status(500).json({ message: "Internal server error", error: err.message || err });
}
});

module.exports = router;