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
    const prompt = `
You are an AI agent that converts raw resume text into a full JSON user object for a portfolio website. The resulting object must follow this exact format, compatible with a MongoDB schema. Do not wrap the result in triple backticks or return plain text — only return a single clean JSON object.

✅ GENERAL OBJECT STRUCTURE:

{
  "email": "user@example.com",
  "name": "Full Name",
  "highlights": [HighlightSchema...],
  "pages": [PageSchema...],
  "activePageId": "page-001"
  "header: "Hello, my name is ___! Contact me at ___"
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
    "content": [
      {
        "url": "https://images.unsplash.com/photo-xxxx",
        "caption": "Short caption"
      }
    ]
  }

When generating a "code" block:
The content field must be a single properly escaped string.
Do not wrap code in an object like { language, code }.
Escape all inner double quotes and preserve line breaks as \n.
Code can only be in strictly html and css.
The structure should look like:

- "code":
{
  "id": "block-xyz",
  "type": "code",
  "content": "<html>\n  <head>\n    <title>Example</title>\n  </head>\n  <body>\n    <p>Hello world!</p>\n  </body>\n</html>"
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
  
- "pdf":
{
    "content" {
    "url": "Resume Link From Google Drive. (Make sure access is public)"
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

- "sideBySide":
  "content": [
    0: { "type": "text", "content": { ... } },
    1: { "type": "image", "content": { ... } }
  ]

STYLE & COMPLETENESS INSTRUCTIONS:
ALL BLOCKS MUST HAVE UNIQUE IDS!!! VERY IMPORTANT.

1. PAGE STRUCTURE:
   - About Page (Required):
     • Title block: Professional introduction
     • Image block: Profile photo placeholder. Look up the user with their name and email and use the image from their linkedin profile or other social media.
     • Text block: Bio (min 200 characters)
     • PDF block: Resume
     • ContactsText block: All professional links
     • MultiBlock: Skills overview with categories

   - Education Page:
     • Title block: "Educational Journey"
     • Flip blocks for each education milestone:
       - Front: Institution logo, degree name, years
       - Back: Key achievements, courses, projects
     • Code block: Showcase relevant academic projects

   - Projects Page:
     • Title block: "Featured Projects"
     • SideBySide blocks for each project:
       - Left: Technical details, outcomes, technologies
       - Right: Project visual or demo
     • Code blocks: Show complex animations or interactive elements

   - Professional Experience:
     • Title block: "Work Experience"
     • SideBySide blocks for each role:
       - Left: Role details, achievements, metrics
       - Right: Company-related visuals
     • MultiBlock: Skills and technologies used

2. CODE BLOCK GUIDELINES:
   - Each code block should demonstrate one of these animations:
     b) Floating elements with particle effects
     c) Progressive reveal with scroll animations
     d) Interactive hover states with glowing effects
     e) Morphing shapes with SVG animations
   - Include comments explaining the animation
   - Use CSS variables for easy customization
   - Implement smooth transitions (0.3s - 0.6s)
   - Add subtle shadows and gradient effects
   - Include hover, focus, and active states
   ⚠️ IMPORTANT: All code blocks must be valid JSON string literals:
  - Escape **all** inner double quotes: use "\""
  - Escape newlines as "\\n"
  - Do not use backticks, HTML entities, or indentation
  - The content must be a flat JSON-safe string


3. CONTENT QUALITY:
   - All text blocks: Minimum 150 characters
   - Use bullet points for better readability
   - Include metrics and specific examples
   - Maintain professional tone
   - Break long content into paragraphs
   - Use active voice and action verbs

4. VISUAL HIERARCHY:
   - Start each page with a title block
   - Group related blocks using multiBlock
   - Alternate between different block types
   - Use sideBySide for visual content
   - Ensure logical content flow

resume:
${resumeText}
`;

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
            content: prompt
          }
        ],
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ GitHub API Error:", errorText);
      return res.status(500).json({ 
        message: "Failed to generate profile", 
        error: "API authorization failed. Please try again later." 
      });
    }

    try {
      const data = await response.json();
      const rawJson = data.choices?.[0]?.message?.content;
      console.log("📝 Raw GPT output:\n", rawJson);

      if (!rawJson) {
        return res.status(500).json({ 
          message: "Failed to generate profile", 
          error: "No content generated" 
        });
      }

      // Parse and validate the JSON
      const parsedJson = JSON.parse(rawJson);
      res.json(parsedJson);
    } catch (err) {
      console.error("❌ Error parsing GPT output:", err);
      res.status(500).json({ 
        message: "Failed to parse generated profile", 
        error: err.message 
      });
    }
  } catch (err) {
    console.error("❌ Error during profile generation:", err);
    res.status(500).json({ 
      message: "Failed to generate profile", 
      error: err.message 
    });
  }
});

module.exports = router;