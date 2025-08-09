require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Middleware
// Configure CORS dynamically for local dev or deployed frontend
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie parser

// Database Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected.");
    // Create admin user on startup if it doesn't exist
    const initAdmin = async () => {
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        const admin = new User({
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          isAdmin: true
        });
        await admin.save();
        console.log('Admin user created.');
      }
    };
    initAdmin();
  })
  .catch(err => console.error("MongoDB connection error:", err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/order'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
