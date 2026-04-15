const { customAlphabet } = require('nanoid');
const bcrypt = require('bcryptjs');
const UAParser = require('ua-parser-js');
const db = require('../config/db');
const validator = require('validator');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 7);

// Helper: Build UTM URL
const buildUtmUrl = (baseUrl, utm) => {
  if (!utm || !Object.values(utm).some(v => v)) return baseUrl;
  const url = new URL(baseUrl);
  if (utm.source)   url.searchParams.set('utm_source',   utm.source);
  if (utm.medium)   url.searchParams.set('utm_medium',   utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  if (utm.content)  url.searchParams.set('utm_content',  utm.content);
  if (utm.term)     url.searchParams.set('utm_term',     utm.term);
  if (utm.id)       url.searchParams.set('utm_id',       utm.id);
  return url.toString();
};

// Reserved words that cannot be used as custom slugs
const RESERVED_SLUGS = ['api', 'health', 'qr', 'vc', 'f', 'login', 'register', 'dashboard', 'admin', 'account'];

// Validate slug format: lowercase alphanumeric + hyphens, 3-50 chars
const isValidSlug = (slug) => /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slug);

// @GET /api/links/check-slug?slug=myslug
const checkSlug = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ success: false, message: 'Slug is required.' });

    const normalized = slug.toLowerCase().trim();

    if (RESERVED_SLUGS.includes(normalized)) {
      return res.json({ available: false, message: `"${normalized}" is a reserved word.` });
    }
    if (!isValidSlug(normalized)) {
      return res.json({ available: false, message: 'Use 3-50 lowercase letters, numbers, or hyphens. Cannot start/end with a hyphen.' });
    }

    const [existing] = await db.query('SELECT id FROM links WHERE short_code = ?', [normalized]);
    if (existing.length) {
      return res.json({ available: false, message: `"/${normalized}" is already taken. Try another.` });
    }
    return res.json({ available: true, message: `"/${normalized}" is available! ✅` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @POST /api/links/create
const createLink = async (req, res) => {
  try {
    const { originalUrl, title, expiryType, expiryValue, password, utm, customSlug } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'URL is required.' });
    }

    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ success: false, message: 'Invalid URL. Include http:// or https://' });
    }

    // Custom slug or auto-generated short code
    let shortCode;
    if (customSlug) {
      const normalized = customSlug.toLowerCase().trim();

      if (RESERVED_SLUGS.includes(normalized)) {
        return res.status(400).json({ success: false, message: `"${normalized}" is a reserved word and cannot be used.` });
      }
      if (!isValidSlug(normalized)) {
        return res.status(400).json({ success: false, message: 'Custom slug must be 3-50 characters, only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.' });
      }

      const [existing] = await db.query('SELECT id FROM links WHERE short_code = ?', [normalized]);
      if (existing.length) {
        return res.status(409).json({ success: false, message: `The custom path "/${normalized}" is already taken. Please choose another.` });
      }
      shortCode = normalized;
    } else {
      // Auto-generate unique short code
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid();
        const [existing] = await db.query('SELECT id FROM links WHERE short_code = ?', [shortCode]);
        if (!existing.length) isUnique = true;
      }
    }

    // Handle expiry
    let expiresAt = null;
    let maxClicks = null;
    const expType = expiryType || 'one_time';

    if (expType === 'time_based' && expiryValue) {
      expiresAt = new Date(Date.now() + parseInt(expiryValue) * 1000);
    } else if (expType === 'click_limit' && expiryValue) {
      maxClicks = parseInt(expiryValue);
    }

    // Handle password
    let passwordHash = null;
    let isPasswordProtected = false;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
      isPasswordProtected = true;
    }

    // UTM params
    const utmSource   = utm?.source   || null;
    const utmMedium   = utm?.medium   || null;
    const utmCampaign = utm?.campaign || null;
    const utmContent  = utm?.content  || null;
    const utmTerm     = utm?.term     || null;
    const utmId       = utm?.id       || null;

    const [result] = await db.query(
      `INSERT INTO links
       (user_id, original_url, short_code, title, expiry_type, expiry_value, expires_at, max_clicks,
        is_password_protected, password_hash,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, originalUrl, shortCode, title || null, expType,
       expiryValue || null, expiresAt, maxClicks, isPasswordProtected, passwordHash,
       utmSource, utmMedium, utmCampaign, utmContent, utmTerm, utmId]
    );

    const shortUrl = `${process.env.APP_URL}/${shortCode}`;

    res.status(201).json({
      success: true,
      message: 'Short link created! 🔗',
      link: {
        id: result.insertId,
        originalUrl,
        shortCode,
        shortUrl,
        title: title || null,
        expiryType: expType,
        expiresAt,
        maxClicks,
        isPasswordProtected,
        totalClicks: 0,
        isExpired: false,
        createdAt: new Date(),
        utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign,
               content: utmContent, term: utmTerm, id: utmId },
      },
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/links - Get all links for user
const getLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `SELECT id, original_url, short_code, title, is_expired, expiry_type,
                  expires_at, max_clicks, total_clicks, is_active, created_at
                  FROM links WHERE user_id = ?`;
    let params = [req.user.id];

    if (search) {
      query += ' AND (original_url LIKE ? OR title LIKE ? OR short_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [links] = await db.query(query, params);

    // Count total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM links WHERE user_id = ?${search ? ' AND (original_url LIKE ? OR title LIKE ?)' : ''}`,
      search ? [req.user.id, `%${search}%`, `%${search}%`] : [req.user.id]
    );

    const appUrl = process.env.APP_URL;
    const formattedLinks = links.map(link => ({
      ...link,
      shortUrl: `${appUrl}/${link.short_code}`,
      // Auto-check time expiry
      isExpired: link.is_expired ||
        (link.expires_at && new Date(link.expires_at) < new Date()) ||
        (link.max_clicks && link.total_clicks >= link.max_clicks),
    }));

    res.json({
      success: true,
      links: formattedLinks,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @DELETE /api/links/:id
const deleteLink = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM links WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    await db.query('DELETE FROM links WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Link deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/links/:id - Edit link
const editLink = async (req, res) => {
  try {
    const { title, originalUrl, expiryType, expiryValue, password, removePassword, utm } = req.body;

    // Verify ownership
    const [rows] = await db.query('SELECT * FROM links WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Link not found.' });

    const link = rows[0];

    // Validate URL if changed
    if (originalUrl && !validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ success: false, message: 'Invalid URL. Include http:// or https://' });
    }

    // Handle expiry changes
    let expiresAt = link.expires_at;
    let maxClicks = link.max_clicks;
    const expType = expiryType || link.expiry_type;

    if (expiryType === 'time_based' && expiryValue) {
      expiresAt = new Date(Date.now() + parseInt(expiryValue) * 1000);
    } else if (expiryType === 'click_limit' && expiryValue) {
      maxClicks = parseInt(expiryValue);
      expiresAt = null;
    } else if (expiryType === 'one_time' || expiryType === 'never') {
      expiresAt = null;
      maxClicks = null;
    }

    // Handle password update
    let passwordHash = link.password_hash;
    let isPasswordProtected = link.is_password_protected;
    if (removePassword) {
      passwordHash = null;
      isPasswordProtected = false;
    } else if (password) {
      passwordHash = await bcrypt.hash(password, 10);
      isPasswordProtected = true;
    }

    await db.query(
      `UPDATE links SET
        title = ?, original_url = ?, expiry_type = ?, expiry_value = ?,
        expires_at = ?, max_clicks = ?, is_password_protected = ?,
        password_hash = ?, is_expired = FALSE,
        utm_source = ?, utm_medium = ?, utm_campaign = ?,
        utm_content = ?, utm_term = ?, utm_id = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : link.title,
        originalUrl || link.original_url,
        expType, expiryValue || link.expiry_value,
        expiresAt, maxClicks,
        isPasswordProtected, passwordHash,
        utm?.source   ?? link.utm_source,
        utm?.medium   ?? link.utm_medium,
        utm?.campaign ?? link.utm_campaign,
        utm?.content  ?? link.utm_content,
        utm?.term     ?? link.utm_term,
        utm?.id       ?? link.utm_id,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Link updated successfully! ✅' });
  } catch (error) {
    console.error('Edit link error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/links/:id/toggle - Toggle active/inactive
const toggleLink = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM links WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Link not found.' });

    const newStatus = !rows[0].is_active;
    await db.query('UPDATE links SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({ success: true, message: newStatus ? 'Link activated.' : 'Link deactivated.', isActive: newStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /:shortCode - Public redirect (in server.js)
const redirectLink = async (req, res) => {
  try {
    const { code } = req.params;
    const { pwd } = req.query;

    const [rows] = await db.query('SELECT * FROM links WHERE short_code = ?', [code]);

    if (!rows.length) {
      return res.status(404).send(getExpiredHTML('Link Not Found', 'This short link does not exist.'));
    }

    const link = rows[0];

    // Check if link is inactive
    if (!link.is_active) {
      return res.status(410).send(getExpiredHTML('Link Disabled', 'This link has been disabled by the owner.'));
    }

    // Check one-time expiry
    if (link.is_expired) {
      return res.status(410).send(getExpiredHTML('Link Expired', 'This one-time link has already been used.'));
    }

    // Check time-based expiry
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      await db.query('UPDATE links SET is_expired = TRUE WHERE id = ?', [link.id]);
      return res.status(410).send(getExpiredHTML('Link Expired', 'This link has expired.'));
    }

    // Check click limit
    if (link.max_clicks && link.total_clicks >= link.max_clicks) {
      await db.query('UPDATE links SET is_expired = TRUE WHERE id = ?', [link.id]);
      return res.status(410).send(getExpiredHTML('Link Expired', `This link reached its maximum of ${link.max_clicks} clicks.`));
    }

    // ── Unique Visit check (per IP) ──────────────────────────────
    // Link stays active for others, but THIS visitor can only click once
    if (link.expiry_type === 'unique_visit') {
      const visitorIP = req.ip;
      const [alreadyVisited] = await db.query(
        'SELECT id FROM click_logs WHERE link_id = ? AND ip_address = ?',
        [link.id, visitorIP]
      );
      if (alreadyVisited.length > 0) {
        return res.status(410).send(getAlreadyUsedHTML());
      }
    }

    // Check password
    if (link.is_password_protected) {
      if (!pwd) {
        return res.send(getPasswordHTML(code));
      }
      const isMatch = await bcrypt.compare(pwd, link.password_hash);
      if (!isMatch) {
        return res.send(getPasswordHTML(code, true));
      }
    }

    // Log click analytics
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    let deviceType = 'desktop';
    if (device.type === 'mobile') deviceType = 'mobile';
    else if (device.type === 'tablet') deviceType = 'tablet';

    await db.query(
      `INSERT INTO click_logs (link_id, ip_address, user_agent, referer, device_type)
       VALUES (?, ?, ?, ?, ?)`,
      [link.id, req.ip, req.headers['user-agent'], req.headers.referer || null, deviceType]
    );

    // Update click count
    await db.query('UPDATE links SET total_clicks = total_clicks + 1 WHERE id = ?', [link.id]);

    // If one-time → mark expired globally
    if (link.expiry_type === 'one_time') {
      await db.query('UPDATE links SET is_expired = TRUE WHERE id = ?', [link.id]);
    }
    // unique_visit → link stays active for others (no global expiry)

    // Build final URL with UTM params if set
    const finalUrl = buildUtmUrl(link.original_url, {
      source:   link.utm_source,
      medium:   link.utm_medium,
      campaign: link.utm_campaign,
      content:  link.utm_content,
      term:     link.utm_term,
      id:       link.utm_id,
    });

    // Redirect!
    res.redirect(finalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Server error.');
  }
};

// HTML for expired links
const getExpiredHTML = (title, message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Limitly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; padding: 2rem; background: #1e293b; border-radius: 16px;
            border: 1px solid #334155; max-width: 400px; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #f87171; }
    p { color: #94a3b8; margin-bottom: 1.5rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #6366f1;
        color: white; border-radius: 8px; text-decoration: none; }
    a:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⏰</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Create Your Own Link</a>
  </div>
</body>
</html>`;

// HTML for already-used unique visit links
const getAlreadyUsedHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Already Used - Limitly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; padding: 2rem; background: #1e293b; border-radius: 16px;
            border: 1px solid #334155; max-width: 420px; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #f59e0b; }
    p { color: #94a3b8; margin-bottom: 0.75rem; line-height: 1.6; }
    .badge { display: inline-block; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b;
             color: #fbbf24; padding: 0.35rem 0.875rem; border-radius: 100px;
             font-size: 0.8rem; margin-bottom: 1.5rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #6366f1;
        color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }
    a:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🚫</div>
    <h1>Already Used!</h1>
    <div class="badge">⚡ Unique Visit Link</div>
    <p>You have already accessed this link once.<br/>
       This link can only be used <strong>one time per person</strong>.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Create Your Own Link</a>
  </div>
</body>
</html>`;

// HTML for password-protected links
const getPasswordHTML = (code, wrongPassword = false) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protected Link - Limitly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; padding: 2rem; background: #1e293b; border-radius: 16px;
            border: 1px solid #334155; max-width: 400px; width: 100%; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { margin-bottom: 0.5rem; }
    p { color: #94a3b8; margin-bottom: 1.5rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    input { padding: 0.75rem; border-radius: 8px; border: 1px solid #334155;
            background: #0f172a; color: white; font-size: 1rem; text-align: center; }
    button { padding: 0.75rem; background: #6366f1; color: white; border: none;
             border-radius: 8px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #4f46e5; }
    .error { color: #f87171; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔐</div>
    <h1>Protected Link</h1>
    <p>Enter the password to access this link</p>
    ${wrongPassword ? '<p class="error">❌ Wrong password. Try again.</p>' : ''}
    <form method="GET" action="/${code}">
      <input type="password" name="pwd" placeholder="Enter password..." required autofocus />
      <button type="submit">Access Link →</button>
    </form>
  </div>
</body>
</html>`;

module.exports = { createLink, getLinks, editLink, deleteLink, toggleLink, redirectLink, checkSlug };
