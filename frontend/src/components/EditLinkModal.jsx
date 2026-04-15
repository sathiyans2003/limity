import { useState } from 'react';
import { linksAPI } from '../api';
import toast from 'react-hot-toast';

const expiryOptions = [
  { value: 'one_time', label: '⏱ One-Time (expires after 1st click)' },
  { value: 'unique_visit', label: '👤 Unique Visit (1 click per person)' },
  { value: 'time_based', label: '⏰ Time-Based (expires after duration)' },
  { value: 'click_limit', label: '🖱 Click Limit (max N clicks)' },
  { value: 'never', label: '♾️ Never Expire' },
];

const EditLinkModal = ({ link, onClose, onUpdated, isPro }) => {
  const [form, setForm] = useState({
    title: link.title || '',
    originalUrl: link.original_url || '',
    expiryType: link.expiry_type || 'one_time',
    expiryValue: link.expiry_value || '',
    password: '',
    removePassword: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.expiryValue) delete payload.expiryValue;
      if (!payload.title) delete payload.title;

      await linksAPI.edit(link.id, payload);
      toast.success('Link updated! ✅');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.875rem', background: '#141414',
    border: '1px solid #222222', borderRadius: '8px', color: 'white',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '16px',
                    width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0 }}>✏️ Edit Link</h2>
            <p style={{ color: '#555555', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
              Short: <span style={{ color: '#c8f135' }}>{link.shortUrl}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888888',
                                             fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Title (optional)</label>
            <input type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="My payment link..." style={inputStyle} />
          </div>

          {/* Original URL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Original URL *</label>
            <input type="url" value={form.originalUrl} required
              onChange={e => setForm({ ...form, originalUrl: e.target.value })}
              placeholder="https://your-long-url.com/..." style={inputStyle} />
          </div>

          {/* Expiry Type */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Expiry Type</label>
            <select value={form.expiryType}
              onChange={e => setForm({ ...form, expiryType: e.target.value, expiryValue: '' })}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {expiryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Time value */}
          {form.expiryType === 'time_based' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Expires after (seconds) — 300 = 5 min</label>
              <input type="number" value={form.expiryValue} min="60"
                onChange={e => setForm({ ...form, expiryValue: e.target.value })}
                placeholder="300" style={inputStyle} />
            </div>
          )}

          {/* Click limit value */}
          {form.expiryType === 'click_limit' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Maximum Clicks</label>
              <input type="number" value={form.expiryValue} min="1"
                onChange={e => setForm({ ...form, expiryValue: e.target.value })}
                placeholder="10" style={inputStyle} />
            </div>
          )}

          {/* Password section (Pro only) */}
          {isPro && (
            <div style={{ marginBottom: '1.25rem' }}>
              {link.is_password_protected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                               marginBottom: '0.75rem', padding: '0.6rem 0.875rem',
                               background: '#141414', borderRadius: '8px', border: '1px solid #222222' }}>
                  <input type="checkbox" id="removePass" checked={form.removePassword}
                    onChange={e => setForm({ ...form, removePassword: e.target.checked, password: '' })}
                    style={{ accentColor: '#ef4444', cursor: 'pointer' }} />
                  <label htmlFor="removePass" style={{ color: '#f87171', fontSize: '0.85rem', cursor: 'pointer' }}>
                    🔓 Remove existing password
                  </label>
                </div>
              )}
              {!form.removePassword && (
                <>
                  <label style={labelStyle}>
                    🔐 {link.is_password_protected ? 'Change Password' : 'Add Password'} (Pro)
                  </label>
                  <input type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={link.is_password_protected ? 'Enter new password...' : 'Leave empty for no password'}
                    style={inputStyle} />
                </>
              )}
            </div>
          )}

          {!isPro && (
            <div style={{ background: 'rgba(200, 241, 53, 0.1)', border: '1px solid #c8f135', borderRadius: '8px',
                           padding: '0.65rem 0.875rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#c8f135' }}>
              🔐 Password protection requires <strong>Pro</strong> plan.
            </div>
          )}

          {/* Note: Resets expired status */}
          {(link.is_expired || link.isExpired) && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #22c55e', borderRadius: '8px',
                           padding: '0.65rem 0.875rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#86efac' }}>
              ✅ Saving this edit will <strong>reactivate</strong> the expired link.
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', background: '#222222', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '0.75rem', background: loading ? '#a8d020' : '#c8f135',
                        color: '#111', border: 'none', borderRadius: '8px', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;
