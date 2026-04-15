const QRCode = require('qrcode');
const { customAlphabet } = require('nanoid');
const db = require('../config/db');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 7);

const genCode = async () => {
  let code, unique = false;
  while (!unique) {
    code = nanoid();
    const [r] = await db.query(
      'SELECT id FROM qrcodes WHERE short_code=? UNION SELECT id FROM vcards WHERE short_code=? UNION SELECT id FROM forms WHERE short_code=? UNION SELECT id FROM links WHERE short_code=?',
      [code, code, code, code]
    );
    if (!r.length) unique = true;
  }
  return code;
};

// @POST /api/qr/create
const createQR = async (req, res) => {
  try {
    const { title, destinationUrl, fgColor, bgColor } = req.body;
    if (!destinationUrl) return res.status(400).json({ success: false, message: 'Destination URL required.' });

    const shortCode = await genCode();
    const shortUrl = `${process.env.APP_URL}/qr/${shortCode}`;

    // Generate QR as base64
    const qrBase64 = await QRCode.toDataURL(shortUrl, {
      color: { dark: fgColor || '#000000', light: bgColor || '#ffffff' },
      width: 400, margin: 2,
    });

    const [result] = await db.query(
      `INSERT INTO qrcodes (user_id, title, destination_url, short_code, fg_color, bg_color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, title || null, destinationUrl, shortCode, fgColor || '#000000', bgColor || '#ffffff']
    );

    res.status(201).json({
      success: true,
      message: 'QR Code created! 📱',
      qr: { id: result.insertId, title, destinationUrl, shortCode, shortUrl, qrBase64,
             fgColor: fgColor || '#000000', bgColor: bgColor || '#ffffff', totalScans: 0 },
    });
  } catch (err) {
    console.error('Create QR error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/qr - Get all QRs for user
const getQRs = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const appUrl = process.env.APP_URL;
    const qrs = await Promise.all(rows.map(async qr => {
      const shortUrl = `${appUrl}/qr/${qr.short_code}`;
      const qrBase64 = await QRCode.toDataURL(shortUrl, {
        color: { dark: qr.fg_color, light: qr.bg_color }, width: 300, margin: 2,
      });
      return { ...qr, shortUrl, qrBase64 };
    }));

    res.json({ success: true, qrs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/qr/:id - Update QR code
const updateQR = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM qrcodes WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'QR not found.' });

    const qr = rows[0];
    const { title, destinationUrl, fgColor, bgColor } = req.body;
    const newTitle = title !== undefined ? title : qr.title;
    const newDest = destinationUrl || qr.destination_url;
    const newFg = fgColor || qr.fg_color;
    const newBg = bgColor || qr.bg_color;

    // Regenerate QR with updated colors
    const shortUrl = `${process.env.APP_URL}/qr/${qr.short_code}`;
    const qrBase64 = await QRCode.toDataURL(shortUrl, {
      color: { dark: newFg, light: newBg }, width: 400, margin: 2,
    });

    await db.query(
      'UPDATE qrcodes SET title=?, destination_url=?, fg_color=?, bg_color=? WHERE id=?',
      [newTitle, newDest, newFg, newBg, req.params.id]
    );

    res.json({
      success: true,
      message: 'QR Code updated! ✅',
      qr: { ...qr, title: newTitle, destination_url: newDest, fg_color: newFg, bg_color: newBg, shortUrl, qrBase64 },
    });
  } catch (err) {
    console.error('Update QR error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/qr/:id/analytics - QR analytics
const getQRAnalytics = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM qrcodes WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'QR not found.' });

    const qr = rows[0];
    const shortUrl = `${process.env.APP_URL}/qr/${qr.short_code}`;

    res.json({
      success: true,
      qr: { ...qr, shortUrl },
      analytics: {
        totalScans: qr.total_scans || 0,
        createdAt: qr.created_at,
      },
    });
  } catch (err) {
    console.error('QR analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @DELETE /api/qr/:id
const deleteQR = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM qrcodes WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'QR not found.' });
    await db.query('DELETE FROM qrcodes WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'QR deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /qr/:code - Public redirect
const redirectQR = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM qrcodes WHERE short_code=?', [req.params.code]);
    if (!rows.length || !rows[0].is_active) {
      return res.status(404).send('<h2>QR Code not found or inactive.</h2>');
    }
    await db.query('UPDATE qrcodes SET total_scans = total_scans + 1 WHERE id=?', [rows[0].id]);
    res.redirect(rows[0].destination_url);
  } catch (err) {
    res.status(500).send('Server error.');
  }
};

module.exports = { createQR, getQRs, updateQR, getQRAnalytics, deleteQR, redirectQR };
