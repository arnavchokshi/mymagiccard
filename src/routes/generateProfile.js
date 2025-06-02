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

GENERAL OBJECT STRUCTURE:

{
  "name": "Full Name",
  "highlights": [HighlightSchema...],
  "pages": [PageSchema...],
  "activePageId": "page-001"
  ""header": [
    "a ___ major",
    "based in ___"
  ]
}

Note: Header builds off of default "I'm " so fill out header with user details. Must add at least 4 headers about user.

HIGHLIGHTS FORMAT:
"highlights": [
  {
    "label": "UX Researcher",
    "category": "Academic" // one of: "Academic", "Professional", "Personal Development", "Extracurricular", "Technical"
  },
  ...
]

PAGES FORMAT:
"pages": [
  {
    "id": "page-001",
    "name": "About",
    "color": "#2502be",
    "blocks": [BlockSchema...]
  },
  ...
]

BLOCKS FORMAT:
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

BLOCK CONTENT FORMATS:

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
      "imageUrl": "https://images.unsplash.com/photo-xxxx",
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

Use at most 4 highlights with max 15 characters. Highlights are users biggest flexing points. (4.0 GPA, Amazon intern, etc.)
Make the color of the pages different but follow a theme.
When adding images in image or flip blocks, use unsplash.com to find images. Try to find images that are relevant to the context of the block.
1. PAGE STRUCTURE:
   - About Page (Required):
     • Title block: Professional introduction
     • Side by Side block:Text block: Bio (min 200 characters), PDF block that just says "Add Google Drive Link to Resume here"
     • ContactsText block: All professional links
     • PDF block: Resume (Only if resume link is provided)
     • MultiBlock: Skills overview with categories. Max out multiblock content to 500 characters. Each bullet should be at most 49 characters long.
     • Title block: "Educational Journey" (When adding education, make sure the student is getting a degree here and not just interning or researching. Add to professional ex)
     • Flip blocks for each education milestone:
       - Front: Institution logo, degree name, years
       - Back: Key achievements, courses, projects

   - Projects Page: (Only if projects are provided)
     • Title block: "Featured Projects"
     • SideBySide blocks for each project:
       - Left: Technical details, outcomes, technologies
       - Right: Project visual or demo
     • Code blocks: Show complex animations or interactive elements

   - Professional Experience: (Only if professional experience is provided)
     • Title block: "Work Experience"
     • SideBySide blocks for each role:
       - Left: Role details, achievements, metrics
       - Right: Company-related visuals
     • MultiBlock: Skills and technologies used

     - Other pages can be made occording to how resume input is formatted.

2. CODE BLOCK GUIDELINES:
   - Each code block must have a graph, pie, or bar chart showing relevant information like languages know, skill level, etc. Animations must be complex and engaging and use physics. Add particle effects and animations.
   - Use CSS variables for easy customization
   - Include hover, focus, and active states
   ⚠️ IMPORTANT: All code blocks must be valid JSON string literals:
  - Escape **all** inner double quotes: use "\""
  - Escape newlines as "\\n"
  - Do not use backticks, HTML entities, or indentation
  - The content must be a flat JSON-safe string


3. CONTENT QUALITY:
   - All text blocks: between minimum 150 characters
   - Use bullet points for better readability
   - Use ALL information given from resume in same wording
   - If character limit is not met make your own content.

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

      const userEmail = req.user.email;
        if (!userEmail) {
          return res.status(401).json({ message: "User not authenticated or email missing" });
        }

        // Don't let AI output overwrite email
        delete parsedJson.email;

        let headerValue = parsedJson.header;
        if (headerValue !== undefined) {
          headerValue = Array.isArray(headerValue) ? headerValue : [headerValue];
        }

        // Only update allowed fields
        const updatedUser = await User.findOneAndUpdate(
          { email: userEmail },
          {
            $set: {
              name: parsedJson.name,
              highlights: parsedJson.highlights,
              pages: parsedJson.pages,
              activePageId: parsedJson.activePageId,
              header: parsedJson.header,
              // Add other fields as needed!
            }
          },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User profile updated for:", updatedUser.email);
        res.json({ userId: updatedUser._id });


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