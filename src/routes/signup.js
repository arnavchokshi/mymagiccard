// routes/signup.js
const express = require('express');
const signupController = require('../controllers/signup'); // Ensure this path is correct
const router = express.Router();

router.post('/register', signupController.createUser); // This should handle POST requests at /user/register

module.exports = router;
