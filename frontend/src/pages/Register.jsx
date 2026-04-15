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

const Register = () => {
  const [form, setForm]             = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Limitly 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      background: '#080808', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔗</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Limitly</span>
          </Link>
          <p style={{ color: '#888', marginTop: '0.75rem', fontSize: '0.9rem' }}>Create your free account</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Full Name</label>
              <input type="text" value={form.name} required
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" style={inp}
                onFocus={e => e.target.style.borderColor = '#c8f135'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Email Address</label>
              <input type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" style={inp}
                onFocus={e => e.target.style.borderColor = '#c8f135'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} required
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  style={{ ...inp, paddingRight: '3rem' }}
                  onFocus={e => e.target.style.borderColor = '#c8f135'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: showPassword ? '#c8f135' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>
                  {showPassword ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: form.password.length < 6 ? '#ef4444' : '#22c55e' }}>
                  {form.password.length < 6 ? `⚠️ ${6 - form.password.length} more characters needed` : '✅ Password looks good!'}
                </div>
              )}
            </div>

            {/* Plan note */}
            <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '9px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#888' }}>
              🆓 Free plan: <strong style={{ color: '#fff' }}>10 links/day</strong> —{' '}
              <span style={{ color: '#c8f135', fontWeight: 600 }}>Upgrade to Pro for unlimited</span>
            </div>

            <button type="submit" disabled={loading} style={btn(loading)}>
              {loading ? '⏳ Creating account...' : 'Create Free Account 🚀'}
            </button>

            <p style={{ textAlign: 'center', color: '#555', marginTop: '1.25rem', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#c8f135', textDecoration: 'none', fontWeight: 700 }}>Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const lbl = { display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 };
const inp = { width: '100%', padding: '0.75rem 1rem', background: '#141414', border: '1px solid #222', borderRadius: '9px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };
const btn = (loading) => ({ width: '100%', padding: '0.875rem', background: loading ? '#a8d020' : '#c8f135', color: '#111', border: 'none', borderRadius: '9px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' });

export default Register;
