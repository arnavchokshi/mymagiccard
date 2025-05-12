const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();

const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const userRoute = require('./routes/user');
const createAdminAccount = require("./scripts/admin");

const app = express();
const PORT = process.env.PORT || 2000;




// Connect to MongoDB
mongoose.connect('mongodb+srv://chokshiarnav:CnR7UHD6hGFxlSw9@majiccluster.edhrvjd.mongodb.net/majic_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Create default admin
createAdminAccount();

// Basic test route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Mount routes
app.use('/user', signupRoute);    // e.g. /user/register
app.use('/auth', loginRoute);     // e.g. /auth/login
app.use('/api', userRoute);       // includes /api/public/:id, /api/setup, etc.

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});
