import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, login } = useAuth(); // We'll use login to update the local user state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile({ name, email });
      // Update local context as well
      const updatedUser = { ...user, name, email };
      localStorage.setItem('limitly_user', JSON.stringify(updatedUser));
      // Usually we'd have a refresh function, but let's just update local storage for now
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('New password too short');
    setPassLoading(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed! 🔐');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your profile, security, and billing.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Section */}
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Profile Information</h3>
          <form onSubmit={handleUpdateProfile} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Security</h3>
          <form onSubmit={handleChangePassword} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} required />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} required />
            </div>
            <button type="submit" disabled={passLoading} style={{ ...btnStyle, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Billing Section */}
        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Billing & Plan</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{user?.plan === 'pro' ? '💎 Pro Suite' : '🆓 Free Plan'}</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(217, 255, 0, 0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>ACTIVE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                {user?.plan === 'pro' 
                  ? `Your subscription expires on ${new Date(user?.plan_expires_at).toLocaleDateString()}` 
                  : 'Upgrade to unlock unlimited links and lead mapping.'}
              </p>
            </div>
            {user?.plan !== 'pro' && (
              <button 
                onClick={() => window.location.href = '/account/upgrade'}
                style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Upgrade Now
              </button>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

const sectionStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow)'
};

const sectionTitleStyle = {
  fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text)'
};

const formStyle = {
  display: 'flex', flexDirection: 'column', gap: '1.25rem'
};

const inputGroupStyle = {
  display: 'flex', flexDirection: 'column', gap: '6px'
};

const labelStyle = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'
};

const inputStyle = {
  padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', 
  borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
};

const btnStyle = {
  alignSelf: 'flex-start', background: 'var(--accent)', color: 'var(--accent-text)', 
  border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', 
  fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s'
};

export default Settings;
