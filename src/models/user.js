const mongoose = require("mongoose");  // Ensure mongoose is required correctly

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhoto: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  blocksGrid: [[{
    type: { type: String, enum: ["text", "link", "image", "code", "pdf", "contactsText", "divider"], required: true },
    content: mongoose.Schema.Types.Mixed
  }]],
  highlights: [{
    category: {
      type: String,
      enum: ["Academic", "Professional", "Personal Development", "Extracurricular", "Technical"],
      required: true
    },
    label: { type: String, required: true }
  }]  
});

const User = mongoose.model("User", userSchema);

module.exports = User;