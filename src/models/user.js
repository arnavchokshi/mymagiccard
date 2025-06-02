const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: mongoose.Schema.Types.Mixed
});

const PageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: "New Page" },
  color: { type: String, default: '#B3A369' },
  blocks: [BlockSchema]
});

const HighlightSchema = new mongoose.Schema({
  label: { type: String, required: true },
  category: {
    type: String,
    enum: ["Academic", "Professional", "Personal Development", "Extracurricular", "Technical"],
    default: "Academic"
  }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  themeColor: { type: String, default: '#B3A369' },
  onboarding: { type: Boolean, default: false },
  template: { 
    type: String, 
    enum: ["Serene", "Sleek", "Professional"],
    default: "Professional"
  },
  name: { type: String, required: true },
  backgroundPhoto: { type: String },
  header: { type: [String], default: ["a __ major", "based in ___", "interested in ___"] },
  highlights: [HighlightSchema],
  pages: [PageSchema],
  activePageId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
