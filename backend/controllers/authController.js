const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const db = require('../config/db');
const { sendResetEmail } = require('../config/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! 🎉',
      token,
      user: { id: result.insertId, name: name.trim(), email: email.toLowerCase(), plan: 'free' },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful! Welcome back 👋',
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // Try with plan_expires_at first, fall back without it
    let rows;
    try {
      [rows] = await db.query(
        'SELECT id, name, email, plan, plan_expires_at, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
    } catch (colErr) {
      // plan_expires_at column may not exist — try without it
      console.warn('getMe: plan_expires_at column missing, falling back:', colErr.message);
      [rows] = await db.query(
        'SELECT id, name, email, plan, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
    }
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required.' });

    // Check if email taken by someone else
    const [existing] = await db.query('SELECT id FROM users WHERE email=? AND id!=?', [email, req.user.id]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Email already in use.' });

    await db.query('UPDATE users SET name=?, email=? WHERE id=?', [name.trim(), email.toLowerCase(), req.user.id]);

    res.json({ success: true, message: 'Profile updated successfully! ✨' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully! 🔐' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const [rows] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email.toLowerCase()]);

    // Always return success (security: don't reveal if email exists)
    if (!rows.length) {
      return res.json({
        success: true,
        message: 'If this email is registered, you will receive a reset link shortly.',
      });
    }

    const user = rows[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to DB
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, tokenExpires, user.id]
    );

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send email
    try {
      await sendResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Clear token on email failure
      await db.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [user.id]);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Check EMAIL_USER and EMAIL_PASS in your .env file.',
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email! Check inbox (and spam folder) 📧',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
};

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token, email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const [rows] = await db.query(
      `SELECT id FROM users
       WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()`,
      [email.toLowerCase(), token]
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or expired. Please request a new one.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password + clear token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, rows[0].id]
    );

    res.json({
      success: true,
      message: 'Password reset successful! 🎉 You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
};

// @POST /api/auth/verify-reset-token  (check if token is still valid)
const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ success: false, message: 'Token and email required.' });
    }

    const [rows] = await db.query(
      `SELECT id FROM users
       WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()`,
      [decodeURIComponent(email).toLowerCase(), token]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, valid: false, message: 'Token expired or invalid.' });
    }

    res.json({ success: true, valid: true, message: 'Token is valid.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verifyResetToken };
