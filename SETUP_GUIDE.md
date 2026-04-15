# 🔗 Limitly — SaaS URL Shortener — Complete Setup Guide

## 📁 Project Structure
```
limitly/
├── backend/               ← Node.js + Express + MySQL
│   ├── controllers/       ← Business logic
│   ├── routes/            ← API endpoints
│   ├── middleware/        ← Auth & rate limiting
│   ├── config/db.js       ← MySQL connection
│   ├── server.js          ← Main server file
│   └── .env.example       ← Environment variables template
│
├── frontend/              ← React.js
│   ├── src/
│   │   ├── pages/         ← LandingPage, Login, Register, Dashboard
│   │   ├── components/    ← CreateLinkModal
│   │   ├── context/       ← AuthContext (JWT management)
│   │   ├── api/           ← Axios API calls
│   │   └── App.jsx        ← Routes
│   └── public/index.html
│
└── database/
    └── schema.sql         ← MySQL tables
```

---

## ⚙️ STEP 1 — MySQL Setup

1. Open MySQL Workbench or phpMyAdmin
2. Run the full `database/schema.sql` file
3. This creates:
   - `limitly_db` database
   - `users`, `links`, `click_logs`, `payment_orders` tables

---

## ⚙️ STEP 2 — Backend Setup

```bash
cd backend
npm install

# Copy env file
cp .env.example .env
```

Edit `.env` with your values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=limitly_db
JWT_SECRET=any_long_random_string_here
RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:5000
```

Run backend:
```bash
npm run dev    # Development (with auto-restart)
npm start      # Production
```

Backend runs at: http://localhost:5000

---

## ⚙️ STEP 3 — Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm start
```

Frontend runs at: http://localhost:3000

---

## 🔐 STEP 4 — Razorpay Setup (Payments)

1. Go to https://razorpay.com → Create account
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret → paste in backend `.env`
4. For production: activate account, switch to Live keys

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/links/create | Create short link |
| GET | /api/links | Get all user links |
| DELETE | /api/links/:id | Delete link |
| PUT | /api/links/:id/toggle | Pause/activate link |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/overview | Dashboard stats |
| GET | /api/analytics/link/:id | Per-link analytics |

### Payment (Razorpay)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment + upgrade |
| GET | /api/payment/status | Get user plan |

### Redirect (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /:shortcode | Redirect to original URL |

---

## 🚀 Features Implemented

### ✅ Auth System
- Register / Login with JWT
- Protected routes
- Auto-logout on token expiry

### ✅ Link Types
- **One-Time** — Expires after first click
- **Time-Based** — Expires after X seconds (5 min, 1 hour, etc.)
- **Click Limit** — Expires after N clicks
- **Never** — Permanent links

### ✅ Password Protection (Pro)
- Password-protected links
- Beautiful password entry page
- bcrypt hashing for security

### ✅ Analytics
- Total clicks tracking
- Device type (mobile/desktop/tablet)
- Referer tracking
- Weekly click chart
- Top performing links
- Per-link detailed analytics

### ✅ Free vs Pro Plans
- Free: 10 links/day limit
- Pro: Unlimited links + all features
- Rate limiting enforced server-side

### ✅ Razorpay Payment
- One-click upgrade to Pro
- ₹499/month (configurable)
- Payment verification with HMAC signature

### ✅ Security
- JWT authentication
- bcrypt password hashing
- Rate limiting (global + auth routes)
- Input validation with validator.js
- SQL injection prevention (parameterized queries)

---

## 🎯 How Expiry Logic Works

```
User clicks short link
         ↓
Backend GET /:shortcode
         ↓
1. Find link in DB
2. Check is_active (paused?) → show disabled page
3. Check is_expired → show expired page
4. Check expires_at (time-based) → show expired if past
5. Check total_clicks >= max_clicks → show expired
6. Check password_protected → show password page
7. Log click (device, IP, referer)
8. Increment total_clicks
9. If one_time → mark is_expired = TRUE
10. REDIRECT → original URL ✅
```

---

## 📦 Deployment (Production)

### Backend → Railway / Render / VPS
```bash
# Set environment variables in platform dashboard
# Deploy from GitHub
```

### Frontend → Vercel / Netlify
```bash
npm run build
# Deploy /build folder
# Set REACT_APP_API_URL to your backend URL
```

### Database → PlanetScale / Railway MySQL / Your VPS

---

## 💰 Monetization Strategy

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 10 links/day, basic tracking |
| Pro | ₹499/month | Unlimited + analytics + password |

**Revenue Target:**
- 100 Pro users × ₹499 = ₹49,900/month 🔥
- 500 Pro users × ₹499 = ₹2,49,500/month 🚀

---

## 🔥 Future Upgrades

1. **QR Code Generator** — npm i qrcode
2. **WhatsApp Share Button** — Direct link sharing
3. **Custom Domains** — users can use their own domain
4. **Team Links** — Multi-user workspaces
5. **API Access** — Developers can integrate via API key
6. **Bulk Link Creation** — CSV upload
7. **Email Notifications** — Alert when link expires

---

Built with ❤️ by Tamil Business Tribe 🙏
