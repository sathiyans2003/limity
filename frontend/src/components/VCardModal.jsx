import { useState } from 'react';
import { vcardAPI } from '../api';
import toast from 'react-hot-toast';

const VCardModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ fullName: '', jobTitle: '', company: '', email: '', phone: '', website: '', address: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await vcardAPI.create(form);
      setResult(res.data.vcard);
      toast.success('vCard created! 👤');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create vCard');
    } finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true); toast.success('Copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = (extra = {}) => ({ width: '100%', padding: '0.65rem 0.875rem', background: '#141414',
    border: '1px solid #222222', borderRadius: '8px', color: 'white',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', ...extra });
  const lbl = { display: 'block', color: '#888888', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 500 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '16px',
                    width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white', margin: 0 }}>👤 New vCard</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        {result ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
              <h3 style={{ color: 'white', margin: '0 0 0.25rem' }}>{result.fullName}</h3>
              {result.jobTitle && <p style={{ color: '#888888', fontSize: '0.875rem', margin: 0 }}>{result.jobTitle}{result.company ? ` @ ${result.company}` : ''}</p>}
            </div>
            <div style={{ background: '#141414', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#555555', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Share link (QR scan → downloads contact):</div>
              <div style={{ color: '#c8f135', fontWeight: 600, wordBreak: 'break-all' }}>{result.shortUrl}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={copyLink} style={{ flex: 1, padding: '0.75rem', background: '#c8f135', color: '#111', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button onClick={() => { setResult(null); setForm({ fullName: '', jobTitle: '', company: '', email: '', phone: '', website: '', address: '', bio: '' }); }}
                style={{ flex: 1, padding: '0.75rem', background: '#222222', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                + New vCard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={lbl}>Full Name *</label>
                <input type="text" value={form.fullName} required onChange={set('fullName')} placeholder="Tamil Selvan" style={inp()} />
              </div>
              <div>
                <label style={lbl}>Job Title</label>
                <input type="text" value={form.jobTitle} onChange={set('jobTitle')} placeholder="CEO" style={inp()} />
              </div>
              <div>
                <label style={lbl}>Company</label>
                <input type="text" value={form.company} onChange={set('company')} placeholder="SM Digital Works" style={inp()} />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" style={inp()} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@gmail.com" style={inp()} />
              </div>
              <div>
                <label style={lbl}>Website</label>
                <input type="url" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" style={inp()} />
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={lbl}>Address</label>
              <input type="text" value={form.address} onChange={set('address')} placeholder="Chennai, Tamil Nadu" style={inp()} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={lbl}>Bio / Note</label>
              <textarea value={form.bio} onChange={set('bio')} placeholder="Short description..." rows={2}
                style={{ ...inp(), resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#222222', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.75rem', background: loading ? '#a8d020' : '#c8f135', color: '#111', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ Creating...' : '👤 Create vCard'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VCardModal;
