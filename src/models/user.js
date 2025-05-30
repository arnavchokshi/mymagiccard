const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: mongoose.Schema.Types.Mixed
});

const PageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: "New Page" },
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
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  backgroundPhoto: { type: String },
  header: { type: String },
  highlights: [HighlightSchema],
  pages: [PageSchema],
  activePageId: { type: String },
  themeColor: { type: String, default: '#b3a369' }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
