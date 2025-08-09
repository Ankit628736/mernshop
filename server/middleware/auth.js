const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Prefer Authorization Bearer token (stateless) over cookie
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  } else {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ error: "Access denied. Not authorized." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Access denied. Admin rights required." });
  }
  next();
};

module.exports = { auth, isAdmin };
