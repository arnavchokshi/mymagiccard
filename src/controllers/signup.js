// controllers/signup.js
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Ensure this path is correct

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
    });

    const savedUser = await user.save();
    res.status(201).json({ user: savedUser, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { createUser };