const express = require("express");
const cors = require("cors"); // Import cors
const {login, refreshToken} = require("../controllers/login");

// Use CORS middleware

const router = express.Router();
router.use(cors());

router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
