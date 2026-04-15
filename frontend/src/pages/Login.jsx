import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      background: '#080808', minHeight: '100vh',
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', height: '64px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🔗</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Limitly</span>
          </Link>

          {/* Center Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { label: 'Products',  href: '/#features' },
              { label: 'Solutions', href: '/#features' },
              { label: 'Pricing',   href: '/#pricing'  },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{
                  color: '#aaa', textDecoration: 'none',
                  padding: '0.45rem 0.95rem', borderRadius: '7px',
                  fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#1a1a1a'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'transparent'; }}
              >{label}</a>
            ))}
          </div>

          {/* Right CTA */}
          <Link to="/register" style={{
            background: '#c8f135', color: '#111',
            textDecoration: 'none',
            padding: '0.5rem 1.2rem', borderRadius: '9px',
            fontWeight: 800, fontSize: '0.875rem',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#b8e020'}
            onMouseLeave={e => e.currentTarget.style.background = '#c8f135'}
          >Get Started →</Link>
        </div>
      </nav>

      {/* Login Form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', padding: '2rem 1rem',
      }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo above form */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Email Address</label>
              <input type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={inp}
                onFocus={e => e.target.style.borderColor = '#c8f135'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#c8f135', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} required
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  style={{ ...inp, paddingRight: '3rem' }}
                  onFocus={e => e.target.style.borderColor = '#c8f135'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: showPassword ? '#c8f135' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem', transition: 'color 0.2s' }}>
                  {showPassword ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={btn(loading)}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>

            <p style={{ textAlign: 'center', color: '#555', marginTop: '1.25rem', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#c8f135', textDecoration: 'none', fontWeight: 700 }}>
                Register Free
              </Link>
            </p>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

const lbl = { display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 };
const inp = { width: '100%', padding: '0.75rem 1rem', background: '#141414', border: '1px solid #222', borderRadius: '9px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };
const btn = (loading) => ({ width: '100%', padding: '0.875rem', background: loading ? '#a8d020' : '#c8f135', color: '#111', border: 'none', borderRadius: '9px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' });

export default Login;
