const express = require("express");
const cors = require("cors");
const userController = require("../controllers/user");
const authMiddleware = require("../utils/authMiddleware");
const User = require("../models/user");


const router = express.Router();
router.use(cors());


// Get all blocks for a user
router.get("/public/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("name email blocks");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Public profile error:", error.message);
      res.status(500).json({ message: "Error retrieving public profile" });
    }
  });
  
  
  // Add a new block
  router.post("/:id/blocks", async (req, res) => {
    try {
      const { type, content } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const newBlock = { type, content, order: user.blocks.length };
      user.blocks.push(newBlock);
      await user.save();
  
      res.status(201).json(user.blocks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  
  // Update a block by index
  router.put("/:id/blocks/:index", async (req, res) => {
    try {
      const { type, content } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const index = parseInt(req.params.index);
      if (index < 0 || index >= user.blocks.length) {
        return res.status(400).json({ message: "Invalid block index" });
      }
  
      user.blocks[index] = { ...user.blocks[index], type, content };
      await user.save();
  
      res.json(user.blocks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a block by index
  router.delete("/:id/blocks/:index", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const index = parseInt(req.params.index);
      if (index < 0 || index >= user.blocks.length) {
        return res.status(400).json({ message: "Invalid block index" });
      }
  
      user.blocks.splice(index, 1);
      await user.save();
  
      res.json(user.blocks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// ✅ PUBLIC profile route
router.get("/public/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("name email");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Public profile error:", error.message);
      res.status(500).json({ message: "Error retrieving public profile" });
    }
  });


//private
router.get("/users", authMiddleware.authenticateToken, userController.getUsers);

module.exports = router;