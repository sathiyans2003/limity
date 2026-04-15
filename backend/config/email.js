require('dotenv').config();

// Lazy-load nodemailer — prevents crash if package not installed
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('⚠️  nodemailer not installed. Run: npm install');
}

// Create transporter only if nodemailer is available + env vars set
const getTransporter = () => {
  if (!nodemailer) throw new Error('nodemailer not installed. Run npm install in backend folder.');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS not set in .env file.');
  }

  // Hostinger SMTP — port 465 SSL
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: true,              // SSL (port 465)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// Send password reset email
const sendResetEmail = async (toEmail, toName, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Limitly <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Reset Your Limitly Password',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;
              border:1px solid #334155;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:2rem;text-align:center;">
      <div style="font-size:2rem;margin-bottom:0.5rem;">🔗</div>
      <h1 style="color:white;margin:0;font-size:1.5rem;font-weight:800;">Limitly</h1>
      <p style="color:#c7d2fe;margin:0.25rem 0 0;font-size:0.9rem;">Smart URL Shortener</p>
    </div>

    <!-- Body -->
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 0.75rem;font-size:1.25rem;">Hi ${toName} 👋</h2>
      <p style="color:#94a3b8;line-height:1.7;margin:0 0 1.5rem;">
        We received a request to reset your Limitly account password.
        Click the button below to set a new password. This link is valid for
        <strong style="color:white;">15 minutes</strong> only.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:2rem 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#6366f1;color:white;text-decoration:none;
                  padding:0.875rem 2rem;border-radius:10px;font-weight:700;font-size:1rem;">
          Reset My Password →
        </a>
      </div>

      <!-- Link fallback -->
      <div style="background:#0f172a;border-radius:8px;padding:1rem;margin-bottom:1.5rem;">
        <p style="color:#64748b;font-size:0.8rem;margin:0 0 0.5rem;">
          Button not working? Copy this link:
        </p>
        <p style="color:#818cf8;font-size:0.8rem;word-break:break-all;margin:0;">
          ${resetUrl}
        </p>
      </div>

      <!-- Warning -->
      <div style="border-left:3px solid #f59e0b;padding-left:1rem;">
        <p style="color:#fbbf24;font-size:0.85rem;margin:0;line-height:1.6;">
          ⚠️ If you did not request a password reset, please ignore this email.
          Your password will remain unchanged.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:1.25rem 2rem;border-top:1px solid #334155;text-align:center;">
      <p style="color:#475569;font-size:0.78rem;margin:0;">
        © 2024 Limitly — Tamil Business Tribe 🙏
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
