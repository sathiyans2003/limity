import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔗</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Limitly</span>
          </Link>
          <p style={{ color: '#888', marginTop: '0.75rem', fontSize: '0.9rem' }}>Reset your password</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
              <h2 style={{ color: '#fff', margin: '0 0 0.75rem', fontWeight: 800 }}>Check Your Email!</h2>
              <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                We sent a reset link to <strong style={{ color: '#c8f135' }}>{email}</strong>.
                Valid for <strong style={{ color: '#fff' }}>15 minutes</strong>.
              </p>
              <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'left', lineHeight: 1.7 }}>
                📌 <strong style={{ color: '#888' }}>Didn't receive it?</strong>
                <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                  <li>Check your <strong style={{ color: '#fff' }}>Spam / Junk</strong> folder</li>
                  <li>Make sure email is correct</li>
                  <li>Wait 1–2 minutes and refresh</li>
                </ul>
              </div>
              <button onClick={() => { setSent(false); setEmail(''); }}
                style={{ width: '100%', padding: '0.75rem', background: '#1e1e1e', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, marginBottom: '1rem' }}>
                ← Try a Different Email
              </button>
              <Link to="/login" style={{ color: '#c8f135', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
                <h2 style={{ color: '#fff', margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 800 }}>Forgot Password?</h2>
                <p style={{ color: '#888', fontSize: '0.875rem', margin: 0 }}>Enter your email — we'll send a reset link</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#141414', border: '1px solid #222', borderRadius: '9px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#c8f135'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.875rem', background: loading ? '#a8d020' : '#c8f135', color: '#111', border: 'none', borderRadius: '9px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1.25rem' }}>
                {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', color: '#555', fontSize: '0.875rem', margin: 0 }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#c8f135', textDecoration: 'none', fontWeight: 700 }}>Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
