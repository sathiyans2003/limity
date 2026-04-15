const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query('SELECT id, name, email, plan FROM users WHERE id = ?', [decoded.id]);

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Check Pro plan
const requirePro = (req, res, next) => {
  if (req.user.plan !== 'pro') {
    return res.status(403).json({
      success: false,
      message: 'This feature requires Pro plan. Upgrade to unlock!',
      upgrade: true,
    });
  }
  next();
};

// Rate limit middleware for free plan (total 5 links maximum)
const checkFreePlanLimit = async (req, res, next) => {
  if (req.user.plan === 'pro') return next();

  // Count total links created by the user
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM links WHERE user_id = ?`,
    [req.user.id]
  );

  const count = rows[0].count;
  const limit = 5; // Hard limit of 5 links total

  if (count >= limit) {
    return res.status(429).json({
      success: false,
      message: `Free plan limit reached (maximum ${limit} links total). Upgrade to Pro for unlimited links!`,
      upgrade: true,
      used: count,
      limit,
    });
  }

  req.linksTotal = count;
  next();
};

module.exports = { protect, requirePro, checkFreePlanLimit };
