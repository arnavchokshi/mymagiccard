const express = require('express');
require("dotenv").config();
console.log("OPENAI_API_KEY loaded:", process.env.OPENAI_API_KEY ? "✅" : "❌");

const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const userRoute = require('./routes/user');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
const createAdminAccount = require("./scripts/admin");




const app = express();
const PORT = process.env.PORT || 2000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://chokshiarnav:CnR7UHD6hGFxlSw9@majiccluster.edhrvjd.mongodb.net/majic_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

createAdminAccount();

// Handle GET request to root URL
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Register the signup route
app.use('/user', signupRoute);
app.use('/auth', loginRoute);
app.use('/api', userRoute);
app.use('/uploads', express.static('uploads'));




// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on: http://192.168.86.40:${PORT}`);
  });
