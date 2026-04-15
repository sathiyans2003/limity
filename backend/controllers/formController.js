const { customAlphabet } = require('nanoid');
const db = require('../config/db');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 7);

const genCode = async () => {
  let code, unique = false;
  while (!unique) {
    code = nanoid();
    const [r] = await db.query(
      'SELECT id FROM forms WHERE short_code=? UNION SELECT id FROM links WHERE short_code=? UNION SELECT id FROM vcards WHERE short_code=? UNION SELECT id FROM qrcodes WHERE short_code=?',
      [code, code, code, code]
    );
    if (!r.length) unique = true;
  }
  return code;
};

// @POST /api/form/create
const createForm = async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!fields || !fields.length) return res.status(400).json({ success: false, message: 'Add at least one field.' });

    const shortCode = await genCode();
    const [result] = await db.query(
      'INSERT INTO forms (user_id, short_code, title, description, fields) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, shortCode, title, description || null, JSON.stringify(fields)]
    );

    const shortUrl = `${process.env.APP_URL}/f/${shortCode}`;
    res.status(201).json({
      success: true, message: 'Form created! 📋',
      form: { id: result.insertId, title, description, fields, shortCode, shortUrl, totalResponses: 0 },
    });
  } catch (err) {
    console.error('Create form error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/form - Get all forms
const getForms = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM forms WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    const appUrl = process.env.APP_URL;
    res.json({ success: true, forms: rows.map(f => ({ ...f, fields: JSON.parse(f.fields), shortUrl: `${appUrl}/f/${f.short_code}` })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/form/:id/responses - Get responses for a form
const getResponses = async (req, res) => {
  try {
    const [form] = await db.query('SELECT id FROM forms WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!form.length) return res.status(404).json({ success: false, message: 'Form not found.' });

    const [responses] = await db.query(
      'SELECT * FROM form_responses WHERE form_id=? ORDER BY submitted_at DESC',
      [req.params.id]
    );
    res.json({ success: true, responses: responses.map(r => ({ ...r, response_data: JSON.parse(r.response_data) })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @DELETE /api/form/:id
const deleteForm = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM forms WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Form not found.' });
    await db.query('DELETE FROM forms WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Form deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/form/:id - Update form
const updateForm = async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    const [rows] = await db.query('SELECT id FROM forms WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Form not found.' });

    await db.query(
      'UPDATE forms SET title=?, description=?, fields=? WHERE id=?',
      [title, description || null, JSON.stringify(fields), req.params.id]
    );

    res.json({ success: true, message: 'Form updated! 📋' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /f/:code - Public form page
const serveForm = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, u.plan 
      FROM forms f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.short_code=?
    `, [req.params.code]);
    
    if (!rows.length || !rows[0].is_active) return res.status(404).send('<h2>Form not found.</h2>');
    const form = { ...rows[0], fields: JSON.parse(rows[0].fields) };
    const isPro = form.plan === 'pro';

    const fieldsHtml = form.fields.map(f => `
      <div style="margin-bottom:1.25rem;">
        <label style="display:block;color:#94a3b8;font-size:0.875rem;margin-bottom:0.4rem;font-weight:500;">
          ${f.label}${f.required ? ' <span style="color:#ef4444">*</span>' : ''}
        </label>
        ${f.type === 'textarea'
          ? `<textarea name="${f.name}" ${f.required ? 'required' : ''} rows="3"
               style="width:100%;padding:0.75rem;background:#0f172a;border:1px solid #334155;
                      border-radius:8px;color:white;font-size:0.95rem;outline:none;
                      resize:vertical;box-sizing:border-box;" placeholder="${f.placeholder || ''}"></textarea>`
          : `<input type="${f.type || 'text'}" name="${f.name}" ${f.required ? 'required' : ''}
               style="width:100%;padding:0.75rem;background:#0f172a;border:1px solid #334155;
                      border-radius:8px;color:white;font-size:0.95rem;outline:none;box-sizing:border-box;"
               placeholder="${f.placeholder || ''}" />`
        }
      </div>`).join('');

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${form.title}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:white;min-height:100vh;
         display:flex;align-items:center;justify-content:center;padding:1.5rem;}
    .card{background:#1e293b;border:1px solid #334155;border-radius:16px;
          padding:2rem;width:100%;max-width:500px;}
    .brand{color:#c8f135;font-weight:800;font-size:0.9rem;margin-bottom:1.5rem;text-align:center;}
    h1{font-size:1.4rem;margin-bottom:0.5rem;}
    p{color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6;}
    button{width:100%;padding:0.875rem;background:#c8f135;color:#111;border:none;
           border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;}
    button:hover{background:#b3d92f;}
    .success{text-align:center;padding:2rem 0;}
    .success .icon{font-size:3rem;margin-bottom:1rem;}
  </style>
</head>
<body>
  <div class="card">
    ${!isPro ? '<div class="brand">⚡ Powered by Limitly</div>' : ''}
    <div id="formContainer">
      <h1>${form.title}</h1>
      ${form.description ? `<p>${form.description}</p>` : ''}
      <form id="mainForm" onsubmit="submitForm(event)">
        ${fieldsHtml}
        <button type="submit" id="submitBtn">Submit →</button>
      </form>
    </div>
  </div>
  <script>
    async function submitForm(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.textContent = '⏳ Submitting...'; btn.disabled = true;
      const data = {};
      new FormData(e.target).forEach((v, k) => data[k] = v);
      const res = await fetch('/f/${form.short_code}/submit', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      if (res.ok) {
        document.getElementById('formContainer').innerHTML =
          '<div class="success"><div class="icon">🎉</div><h2>Thank you!</h2>' +
          '<p style="color:#94a3b8;margin-top:0.5rem">Your response has been submitted.</p></div>';
      } else {
        btn.textContent = 'Submit →'; btn.disabled = false;
        alert('Submission failed. Try again.');
      }
    }
  </script>
</body></html>`);
  } catch (err) {
    res.status(500).send('Server error.');
  }
};

// @POST /f/:code/submit - Public form submission
const submitForm = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM forms WHERE short_code=? AND is_active=TRUE', [req.params.code]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Form not found.' });

    await db.query(
      'INSERT INTO form_responses (form_id, response_data, ip_address) VALUES (?, ?, ?)',
      [rows[0].id, JSON.stringify(req.body), req.ip]
    );
    await db.query('UPDATE forms SET total_responses = total_responses + 1 WHERE id=?', [rows[0].id]);

    res.json({ success: true, message: 'Response submitted! 🎉' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createForm, getForms, getResponses, deleteForm, updateForm, serveForm, submitForm };
