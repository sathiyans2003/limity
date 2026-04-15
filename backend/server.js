const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy (for correct IP in logs)
app.set('trust proxy', 1);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Global rate limiter (Disabled as per user request)
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 200,
//   message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
// });
// app.use(globalLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/vcard', require('./routes/vcard'));
app.use('/api/form', require('./routes/form'));
app.use('/api/alt', require('./routes/alt'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Limitly API is running 🚀', timestamp: new Date() });
});

// ─── Public Routes ────────────────────────────────────────────────────────────
const { redirectLink } = require('./controllers/linkController');
const { redirectQR } = require('./controllers/qrController');
const { serveVcard } = require('./controllers/vcardController');
const { serveForm, submitForm } = require('./controllers/formController');

app.get('/qr/:code', redirectQR);
app.get('/vc/:code', serveVcard);
app.get('/f/:code', serveForm);
app.post('/f/:code/submit', submitForm);
app.get('/:code', redirectLink);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🔗 LIMITLY - URL Shortener API    ║
  ║   Running on http://localhost:${PORT}   ║
  ╚══════════════════════════════════════╝
  `);
});
