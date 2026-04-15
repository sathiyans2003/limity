import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ══════════════════════════════════════════
   SM DIGITAL WORKS BRAND COLORS
   Exact match from smdigitalworks.com
══════════════════════════════════════════ */
const C = {
  // Backgrounds
  bg: '#030712',      // Deep Navy / Dark
  bgCard: '#0B1120',      // Card / section dark (Navy)
  bgCard2: '#0f172a',      // Slightly lighter navy
  navBg: '#FFFFFF',      // White navbar

  // Key colors
  accent: '#FACC15',      // 🔑 SM Digital Works Signature Gold/Yellow
  accentDk: '#EAB308',      // Darker yellow for hover
  white: '#ffffff',
  dark: '#0B1120',      // Brand Navy

  // Text
  textWhite: '#ffffff',
  textGray: '#94A3B8',
  textLt: '#64748B',
  textNav: '#0B1120',

  // Borders
  border: '#1E293B',
  borderLt: '#e2e8f0',
};

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function LandingPage() {
  const [claimValue, setClaimValue] = useState('');

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: C.bg, color: C.textWhite, overflowX: 'hidden',
    }}>

      {/* ── ANNOUNCEMENT BAR ───────────────────── */}
      <div style={{
        background: C.accent, color: C.dark,
        textAlign: 'center', padding: '0.55rem 1rem',
        fontSize: '0.82rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <span>🚀</span>
        <span>Limitly Pro is here — Unlimited Links, QR Codes, vCards & Forms</span>
        <Link to="/register" style={{
          color: C.dark, fontWeight: 800, textDecoration: 'none',
          borderBottom: `1.5px solid ${C.dark}`, marginLeft: '6px',
        }}>Get Started →</Link>
      </div>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: C.navBg,
        borderBottom: `1px solid ${C.borderLt}`,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', height: '64px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: C.dark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
            }}>🔗</div>
            <span style={{
              fontSize: '1.2rem', fontWeight: 900, color: C.textNav,
              letterSpacing: '-0.5px',
            }}>Limitly</span>
          </div>

          {/* Right CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" style={{
              color: '#444', textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: 600,
            }}>Log in</Link>
            <Link to="/register" style={{
              background: C.dark, color: C.white,
              textDecoration: 'none',
              padding: '0.55rem 1.25rem', borderRadius: '9px',
              fontWeight: 700, fontSize: '0.875rem',
            }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────── */}
      <section style={{
        background: C.bg,
        padding: '6rem 2rem 5rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Top badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#0B1120', border: '1px solid #1E293B',
          color: C.textGray, borderRadius: '100px',
          padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 600,
          marginBottom: '2rem', letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          Limitly · Link Management Platform
        </div>

        {/* BIG Headline */}
        <h1 style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 900, lineHeight: 1.05,
          margin: '0 auto 0.25rem',
          maxWidth: '850px',
          letterSpacing: '-3px',
          color: C.white,
        }}>
          Manage It All
        </h1>
        <h1 style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 900, lineHeight: 1.05,
          margin: '0 auto 1.5rem',
          maxWidth: '850px',
          letterSpacing: '-3px',
          fontStyle: 'italic',
          color: C.accent,
        }}>
          On Limitly
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: C.textGray,
          maxWidth: '520px', margin: '0 auto 2.75rem', lineHeight: 1.7,
        }}>
          Manage QR codes, links, digital business cards, and forms.
          Build, track, and connect effortlessly — all in one platform.
        </p>

        {/* Claim CTA Box */}
        <div style={{
          display: 'flex', alignItems: 'center',
          maxWidth: '500px', margin: '0 auto 1rem',
          background: '#0B1120', borderRadius: '12px',
          border: '1px solid #1E293B',
          overflow: 'hidden',
        }}>
          <span style={{
            padding: '0 0 0 1.1rem', color: C.textGray,
            fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap',
          }}>limitly.io/</span>
          <input
            type="text"
            value={claimValue}
            onChange={e => setClaimValue(e.target.value)}
            placeholder="yourname"
            style={{
              flex: 1, padding: '0.95rem 0.5rem',
              border: 'none', outline: 'none',
              fontSize: '0.95rem', color: C.white,
              background: 'transparent',
            }}
          />
          <Link to="/register" style={{
            background: C.accent, color: C.dark,
            textDecoration: 'none',
            padding: '0.95rem 1.5rem', fontWeight: 800,
            fontSize: '0.9rem', whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}>
            Claim Link →
          </Link>
        </div>
        <p style={{ color: '#444', fontSize: '0.78rem', marginTop: '0.75rem' }}>
          ✓ Free forever &nbsp;·&nbsp; ✓ No credit card needed
        </p>

        {/* Social Proof */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', marginTop: '2.5rem',
        }}>
          <div style={{ display: 'flex' }}>
            {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map((color, i) => (
              <div key={i} style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: color,
                border: '2px solid #030712',
                marginLeft: i > 0 ? '-8px' : 0,
                position: 'relative', zIndex: 5 - i,
              }} />
            ))}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.white }}>
              Join <span style={{ color: C.accent }}>1,000+</span> creators & businesses
            </div>
            <div style={{ fontSize: '0.75rem', color: C.textGray }}>using Limitly to grow their presence</div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────── */}
      <section style={{ background: '#020617', borderTop: '1px solid #1E293B', borderBottom: '1px solid #1E293B', padding: '2.5rem 2rem' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', textAlign: 'center',
        }}>
          {[
            { num: '100+', label: 'Active Users' },
            { num: '5+', label: 'Powerful Tools' },
            { num: '99.9%', label: 'Uptime' },
            { num: '100ms', label: 'Redirect Speed' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: C.accent, letterSpacing: '-1px' }}>{s.num}</div>
              <div style={{ color: C.textGray, fontSize: '0.8rem', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────── */}
      <section id="features" style={{ padding: '5.5rem 2rem', background: C.bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-block', background: '#0B1120',
              border: '1px solid #1E293B', color: C.accent,
              borderRadius: '100px', padding: '0.3rem 0.9rem',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>Features</div>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 900, margin: '0 0 1rem', letterSpacing: '-1.5px',
              color: C.white,
            }}>
              Everything You Need
            </h2>
            <p style={{ color: C.textGray, fontSize: '1rem', maxWidth: '460px', margin: '0 auto' }}>
              From short links to QR codes, digital cards to forms — all in one place.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1px',
            border: '1px solid #1E293B', borderRadius: '16px', overflow: 'hidden',
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: i % 2 === 0 ? C.bgCard : C.bgCard2,
                padding: '2rem',
                transition: 'background 0.2s',
                borderRight: (i + 1) % 3 === 0 ? 'none' : '1px solid #1E293B',
                borderBottom: i >= FEATURES.length - 3 ? 'none' : '1px solid #1E293B',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.bgCard : C.bgCard2}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.95rem', color: C.white }}>
                  {f.title}
                </h3>
                <p style={{ margin: 0, color: C.textGray, fontSize: '0.85rem', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────── */}
      <section style={{ padding: '5.5rem 2rem', background: '#020617' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(250,204,21,0.1)',
            border: '1px solid rgba(250,204,21,0.3)', color: C.accent,
            borderRadius: '100px', padding: '0.3rem 0.9rem',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>How it works</div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 900, margin: '0 0 3.5rem', letterSpacing: '-1.5px',
            color: C.white,
          }}>
            3 Simple Steps
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: C.accent, color: C.dark,
                  fontWeight: 900, fontSize: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>{i + 1}</div>
                <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: C.white }}>{s.title}</h3>
                <p style={{ color: C.textGray, fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT CARDS ────────────────────── */}
      <section style={{ padding: '5.5rem 2rem', background: C.bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 900, marginBottom: '3rem', letterSpacing: '-1.5px',
            color: C.white,
          }}>
            More Than a URL Shortener
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} style={{
                background: i === 0 ? C.accent : i === 1 ? '#0B1120' : '#0f172a',
                border: i === 0 ? 'none' : '1px solid #1E293B',
                borderRadius: '20px', padding: '2.25rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{h.icon}</div>
                <h3 style={{
                  margin: '0 0 0.6rem', fontWeight: 800, fontSize: '1.1rem',
                  color: i === 0 ? C.dark : C.white,
                }}>{h.title}</h3>
                <p style={{
                  margin: 0, fontSize: '0.875rem', lineHeight: 1.65,
                  color: i === 0 ? '#333' : C.textGray,
                }}>{h.desc}</p>
                {/* BG emoji watermark */}
                <div style={{
                  position: 'absolute', bottom: '-15px', right: '-10px',
                  fontSize: '5rem', opacity: 0.08, userSelect: 'none',
                }}>{h.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────── */}
      <section id="pricing" style={{ padding: '5.5rem 2rem', background: '#020617' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(250,204,21,0.1)',
              border: '1px solid rgba(250,204,21,0.3)', color: C.accent,
              borderRadius: '100px', padding: '0.3rem 0.9rem',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>Pricing</div>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-1.5px',
              color: C.white,
            }}>Simple Pricing</h2>
            <p style={{ color: C.textGray, fontSize: '1rem' }}>
              Start free. Upgrade when you grow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* FREE */}
            <div style={{
              background: '#0B1120', border: '1px solid #1E293B',
              borderRadius: '20px', padding: '2rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.textGray, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Free
              </div>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, color: C.white, letterSpacing: '-2px', margin: '0.25rem 0' }}>
                ₹0
              </div>
              <div style={{ color: C.textGray, fontSize: '0.8rem', marginBottom: '2rem' }}>Forever free</div>

              {FREE_PLAN.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.7rem' }}>
                  <span style={{ color: C.accent, fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span style={{ color: '#aaa', fontSize: '0.875rem' }}>{item}</span>
                </div>
              ))}

              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: '2rem',
                background: '#1a1a1a', color: C.white,
                border: '1px solid #333',
                textDecoration: 'none', padding: '0.85rem',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
              }}>
                Get Started Free
              </Link>
            </div>

            {/* PRO */}
            <div style={{
              background: C.accent,
              borderRadius: '20px', padding: '2rem',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-14px', right: '1.5rem',
                background: C.dark, color: C.accent,
                padding: '4px 14px', borderRadius: '100px',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>Most Popular 🔥</div>

              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pro
              </div>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, color: C.dark, letterSpacing: '-2px', margin: '0.25rem 0' }}>
                ₹499
              </div>
              <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '2rem' }}>per month</div>

              {PRO_PLAN.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.7rem' }}>
                  <span style={{ color: C.dark, fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span style={{ color: '#333', fontSize: '0.875rem' }}>{item}</span>
                </div>
              ))}

              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: '2rem',
                background: C.dark, color: C.accent,
                textDecoration: 'none', padding: '0.85rem',
                borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem',
              }}>
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────── */}
      <section style={{
        background: C.accent, padding: '5rem 2rem', textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, color: C.dark,
          margin: '0 0 1rem', letterSpacing: '-2px',
        }}>
          Ready to manage it all?
        </h2>
        <p style={{ color: '#333', fontSize: '1.05rem', margin: '0 0 2.5rem' }}>
          Join creators and businesses using Limitly to grow their digital presence.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            background: C.dark, color: C.accent,
            textDecoration: 'none',
            padding: '1rem 2.5rem', borderRadius: '12px',
            fontWeight: 800, fontSize: '1.05rem',
          }}>
            Get Started Free →
          </Link>
          <Link to="/login" style={{
            background: 'rgba(0,0,0,0.1)', color: C.dark,
            textDecoration: 'none',
            padding: '1rem 2rem', borderRadius: '12px',
            fontWeight: 700, fontSize: '1rem',
            border: '1px solid rgba(0,0,0,0.2)',
          }}>
            See All Details
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer style={{ background: '#020617', borderTop: '1px solid #1E293B', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem', marginBottom: '3rem',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: C.accent, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.1rem',
                }}>🔗</div>
                <span style={{ fontWeight: 900, color: C.white, fontSize: '1.1rem' }}>Limitly</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: C.textGray, margin: 0 }}>
                All-in-one link management platform for creators, businesses & agencies.
              </p>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontWeight: 700, color: C.white, marginBottom: '1rem', fontSize: '0.85rem' }}>Product</div>
              {['Links', 'QR Codes', 'vCards', 'Forms', 'Alt Generator'].map(item => (
                <div key={item} style={{ marginBottom: '0.5rem' }}>
                  <a href="#features" style={{
                    color: C.textGray, textDecoration: 'none',
                    fontSize: '0.82rem', transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = C.accent}
                    onMouseLeave={e => e.currentTarget.style.color = C.textGray}
                  >{item}</a>
                </div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontWeight: 700, color: C.white, marginBottom: '1rem', fontSize: '0.85rem' }}>Company</div>
              {['About', 'Pricing', 'Blog', 'Contact'].map(item => (
                <div key={item} style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: C.textGray, textDecoration: 'none', fontSize: '0.82rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.accent}
                    onMouseLeave={e => e.currentTarget.style.color = C.textGray}>{item}</a>
                </div>
              ))}
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontWeight: 700, color: C.white, marginBottom: '1rem', fontSize: '0.85rem' }}>Legal</div>
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
                { label: 'Cookie Policy', path: '/cookies' }
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '0.5rem' }}>
                  <Link to={item.path} style={{ color: C.textGray, textDecoration: 'none', fontSize: '0.82rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.accent}
                    onMouseLeave={e => e.currentTarget.style.color = C.textGray}>{item.label}</Link>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #1E293B', paddingTop: '1.5rem',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: C.textGray }}>
              © 2026 Limitly · Built with ❤️ by{' '}
              <a href="https://smdigitalworks.com" target="_blank" rel="noreferrer"
                style={{ color: C.accent, textDecoration: 'none', fontWeight: 700 }}>
                SM Digital Works
              </a>
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: C.textGray }}>SM DIGITAL WORKS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
const FEATURES = [
  {
    icon: '🔗', title: 'Smart Short Links',
    desc: 'One-time, click-limit, time-based, or per-person expiry links. Full analytics included with every link.'
  },
  {
    icon: '📱', title: 'QR Code Generator',
    desc: 'Generate dynamic QR codes instantly. Customize colors, track scans, and update destinations anytime.'
  },
  {
    icon: '👤', title: 'Digital vCards',
    desc: 'Shareable digital business cards. One tap or scan auto-downloads your contact as a .vcf file.'
  },
  {
    icon: '📋', title: 'Form Builder',
    desc: 'Build custom forms with a shareable link. Collect leads, registrations, or feedback — zero code needed.'
  },
  {
    icon: '🖼️', title: 'AI Alt Generator',
    desc: 'AI-powered alternative text for images. Improve accessibility and SEO in seconds with one click.'
  },
  {
    icon: '📊', title: 'Click Analytics',
    desc: 'Track every click — device, location, referrer, and time. Make data-driven decisions instantly.'
  },
  {
    icon: '🔐', title: 'Password Protection',
    desc: 'Add password protection to any short link. Only authorized users can access your content.'
  },
  {
    icon: '⚡', title: 'UTM Tracking',
    desc: 'Automatically append UTM parameters to any link. Track campaign performance across all channels.'
  },
  {
    icon: '🔐', title: 'Custom Short Codes',
    desc: 'Choose your own short code instead of random characters. Make your links memorable and branded.'
  },
];

const STEPS = [
  {
    title: 'Sign up free',
    desc: 'Create your account in seconds. No credit card required. Start with 10 links per day free.'
  },
  {
    title: 'Create your link',
    desc: 'Shorten a URL, generate a QR code, create a vCard, or build a form — all from one dashboard.'
  },
  {
    title: 'Share & track',
    desc: 'Share your link anywhere. Watch real-time clicks, scans, and form responses roll in.'
  },
];

const HIGHLIGHTS = [
  {
    icon: '📱', title: 'QR Codes That Work',
    desc: 'Generate beautiful, scannable QR codes in seconds. Track every scan and update the destination without reprinting.',
  },
  {
    icon: '👤', title: 'Digital Business Cards',
    desc: 'Replace paper business cards with a smart vCard. Share your contact details via a single tap or scan.',
  },
  {
    icon: '📋', title: 'Forms That Convert',
    desc: 'Build beautiful forms with a shareable link. Collect leads, registrations, or feedback with zero code.',
  },
];

const FREE_PLAN = [
  '10 short links per day',
  'QR Code generator',
  'Digital vCard creator',
  'Form builder',
  'Basic click tracking',
  'Custom short codes',
];

const PRO_PLAN = [
  'Unlimited short links',
  'Advanced analytics dashboard',
  'All expiry types (one-time, timed, click-limit, per-person)',
  'Password-protected links',
  'UTM parameter tracking',
  'AI Alt Generator (50 ops/day)',
  'Priority support',
];
