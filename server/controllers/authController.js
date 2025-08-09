const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] Missing JWT_SECRET environment variable');
      return res.status(500).json({ error: 'Server misconfiguration: JWT secret not set.' });
    }
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Cookie settings: allow cross-site (frontend domain different from API) in production
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // must be true for SameSite=None on modern browsers
      sameSite: isProd ? 'none' : 'lax', // lowercase per cookie spec
      domain: process.env.COOKIE_DOMAIN || undefined, // optionally set e.g. yourdomain.com for subdomains
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    };
    res.cookie('token', token, cookieOptions);
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (err) {
  console.error('[AUTH][LOGIN] Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// User Logout
exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully." });
};

// Get Current User Status
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
