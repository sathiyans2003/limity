import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [tokenValid, setTokenValid]   = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    if (!token || !email) { setTokenValid(false); return; }
    authAPI.verifyResetToken({ token, email }).then(() => setTokenValid(true)).catch(() => setTokenValid(false));
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPass) return toast.error('Passwords do not match!');
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ token, email, newPassword });
      toast.success(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Try again.');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '0.75rem 1rem', background: '#141414', border: '1px solid #222', borderRadius: '9px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', paddingRight: '3rem' };
  const eyeBtn = (active) => ({ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: active ? '#c8f135' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' });

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔗</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Limitly</span>
          </Link>
          <p style={{ color: '#888', marginTop: '0.75rem', fontSize: '0.9rem' }}>Create a new password</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '2rem' }}>
          {tokenValid === null && <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>⏳ Verifying reset link...</div>}

          {tokenValid === false && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
              <h2 style={{ color: '#ef4444', margin: '0 0 0.75rem', fontWeight: 800 }}>Link Expired!</h2>
              <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '1.5rem' }}>This reset link is invalid or expired. Links are valid for <strong style={{ color: '#fff' }}>15 minutes</strong>.</p>
              <Link to="/forgot-password" style={{ display: 'block', padding: '0.875rem', background: '#c8f135', color: '#111', textDecoration: 'none', borderRadius: '9px', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>Request New Reset Link</Link>
              <Link to="/login" style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Login</Link>
            </div>
          )}

          {success && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ color: '#22c55e', margin: '0 0 0.75rem', fontWeight: 800 }}>Password Reset!</h2>
              <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '1.5rem' }}>Password updated! Redirecting in <strong style={{ color: '#fff' }}>3 seconds</strong>...</p>
              <Link to="/login" style={{ display: 'block', padding: '0.875rem', background: '#c8f135', color: '#111', textDecoration: 'none', borderRadius: '9px', fontWeight: 800, textAlign: 'center' }}>→ Go to Login</Link>
            </div>
          )}

          {tokenValid === true && !success && (
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
                <h2 style={{ color: '#fff', margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 800 }}>Create New Password</h2>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>For: <span style={{ color: '#c8f135' }}>{decodeURIComponent(email)}</span></p>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#c8f135'} onBlur={e => e.target.style.borderColor = '#222'} />
                  <button type="button" onClick={() => setShowNew(p => !p)} style={eyeBtn(showNew)}>{showNew ? <EyeClose /> : <EyeOpen />}</button>
                </div>
                {newPassword.length > 0 && <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: newPassword.length < 6 ? '#ef4444' : '#22c55e' }}>{newPassword.length < 6 ? `⚠️ ${6 - newPassword.length} more needed` : '✅ Password looks good!'}</div>}
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter password" required style={inp}
                    onFocus={e => e.target.style.borderColor = '#c8f135'} onBlur={e => e.target.style.borderColor = '#222'} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} style={eyeBtn(showConfirm)}>{showConfirm ? <EyeClose /> : <EyeOpen />}</button>
                </div>
                {confirmPass.length > 0 && <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: newPassword === confirmPass ? '#22c55e' : '#ef4444' }}>{newPassword === confirmPass ? '✅ Passwords match!' : '❌ Passwords do not match'}</div>}
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: loading ? '#a8d020' : '#c8f135', color: '#111', border: 'none', borderRadius: '9px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
