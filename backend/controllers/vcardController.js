const { customAlphabet } = require('nanoid');
const db = require('../config/db');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 7);

const genCode = async () => {
  let code, unique = false;
  while (!unique) {
    code = nanoid();
    const [r] = await db.query(
      'SELECT id FROM vcards WHERE short_code=? UNION SELECT id FROM links WHERE short_code=? UNION SELECT id FROM qrcodes WHERE short_code=? UNION SELECT id FROM forms WHERE short_code=?',
      [code, code, code, code]
    );
    if (!r.length) unique = true;
  }
  return code;
};

// Build .vcf content
const buildVcf = (v) => [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${v.full_name}`,
  v.job_title ? `TITLE:${v.job_title}` : '',
  v.company   ? `ORG:${v.company}` : '',
  v.email     ? `EMAIL:${v.email}` : '',
  v.phone     ? `TEL:${v.phone}` : '',
  v.website   ? `URL:${v.website}` : '',
  v.address   ? `ADR:;;${v.address};;;;` : '',
  v.bio       ? `NOTE:${v.bio}` : '',
  'END:VCARD',
].filter(Boolean).join('\n');

// @POST /api/vcard/create
const createVcard = async (req, res) => {
  try {
    const { fullName, jobTitle, company, email, phone, website, address, bio } = req.body;
    if (!fullName) return res.status(400).json({ success: false, message: 'Full name is required.' });

    const shortCode = await genCode();

    const [result] = await db.query(
      `INSERT INTO vcards (user_id, short_code, full_name, job_title, company, email, phone, website, address, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, shortCode, fullName, jobTitle || null, company || null,
       email || null, phone || null, website || null, address || null, bio || null]
    );

    const shortUrl = `${process.env.APP_URL}/vc/${shortCode}`;

    res.status(201).json({
      success: true,
      message: 'vCard created! 👤',
      vcard: { id: result.insertId, fullName, jobTitle, company, email, phone,
               website, address, bio, shortCode, shortUrl, totalScans: 0 },
    });
  } catch (err) {
    console.error('Create vCard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/vcard - Get all vCards
const getVcards = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vcards WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    const appUrl = process.env.APP_URL;
    res.json({ success: true, vcards: rows.map(v => ({ ...v, shortUrl: `${appUrl}/vc/${v.short_code}` })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @DELETE /api/vcard/:id
const deleteVcard = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM vcards WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'vCard not found.' });
    await db.query('DELETE FROM vcards WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'vCard deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /vc/:code - Public: download .vcf
const serveVcard = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vcards WHERE short_code=?', [req.params.code]);
    if (!rows.length || !rows[0].is_active) return res.status(404).send('vCard not found.');

    await db.query('UPDATE vcards SET total_scans = total_scans + 1 WHERE id=?', [rows[0].id]);

    const vcf = buildVcf(rows[0]);
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].full_name.replace(/\s+/g, '_')}.vcf"`);
    res.send(vcf);
  } catch (err) {
    res.status(500).send('Server error.');
  }
};

module.exports = { createVcard, getVcards, deleteVcard, serveVcard };
