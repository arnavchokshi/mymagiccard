const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
const fs = require('fs');
const path = require('path');

// Define uploads directory based on environment
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/uploads'  // Render.com persistent disk path
  : path.join(__dirname, 'uploads'); // Local development path

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const userRoute = require('./routes/user');
const createAdminAccount = require("./scripts/admin");
require("dotenv").config();
const imageUploadRoute = require("./routes/imageUpload");

const allowedOrigins = [
  'https://magicframes.onrender.com',
  'http://localhost:3000'
];

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
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", imageUploadRoute);

// Create default admin
createAdminAccount();

// Basic test route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

const generateRoute = require("./routes/generateProfile");
app.use("/api", generateRoute);

// Mount routes
app.use('/user', signupRoute);    // e.g. /user/register
app.use('/auth', loginRoute);     // e.g. /auth/login
app.use('/api/me', userRoute);    // handle /me route first!
app.use('/api', userRoute);       // includes /api/setup, /api/:id, etc.
app.use('/public', userRoute);    // handle public profile routes

// Configure static file serving for uploads
app.use('/uploads', express.static(uploadsDir));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on: http://0.0.0.0:${PORT}`);
});

