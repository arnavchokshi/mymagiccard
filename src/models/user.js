const mongoose = require("mongoose");  // Ensure mongoose is required correctly

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  blocks: { type: Array, default: []},
});

const User = mongoose.model("User", userSchema);

module.exports = User;
