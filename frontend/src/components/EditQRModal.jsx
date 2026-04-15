import { useState } from 'react';
import { qrAPI } from '../api';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#000000', '#f97316', '#06b6d4', '#8b5cf6',
  '#ec4899', '#ef4444', '#22c55e',
];

const EditQRModal = ({ qr, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    title: qr.title || '',
    destinationUrl: qr.destination_url || '',
    fgColor: qr.fg_color || '#000000',
    bgColor: qr.bg_color || '#ffffff',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await qrAPI.update(qr.id, form);
      toast.success('QR Code updated! ✅');
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update QR');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '0.75rem 1rem',
    background: '#111111', border: '1.5px solid #222222',
    borderRadius: '9px', color: '#e2e8f0', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#0a0a0a', borderRadius: '16px', border: '1px solid #222222',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem', borderBottom: '1px solid #222222',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>Edit QR Code</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Update your QR code details</p>
          </div>
          <button onClick={onClose} style={{
            background: '#1e293b', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: '#94a3b8',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem' }}>
          {/* Destination URL */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Destination URL
            </label>
            <input
              type="url" required
              value={form.destinationUrl}
              onChange={e => setForm(p => ({ ...p, destinationUrl: e.target.value }))}
              placeholder="https://example.com"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#c8f135'}
              onBlur={e => e.target.style.borderColor = '#222222'}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Title <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="My QR Code"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#c8f135'}
              onBlur={e => e.target.style.borderColor = '#222222'}
            />
          </div>

          {/* QR Color */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              QR Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color} type="button"
                  onClick={() => setForm(p => ({ ...p, fgColor: color }))}
                  style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: color,
                    border: form.fgColor === color ? '3px solid #c8f135' : '3px solid transparent',
                    boxShadow: form.fgColor === color ? '0 0 0 2px #c8f135' : '0 1px 3px rgba(0,0,0,0.3)',
                    cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                  }}
                />
              ))}
              <label style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                border: '2px solid #333', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
              }} title="Custom color">
                <span style={{ fontSize: '0.9rem', zIndex: 1, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>+</span>
                <input type="color" value={form.fgColor}
                  onChange={e => setForm(p => ({ ...p, fgColor: e.target.value }))}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </label>
            </div>
          </div>

          {/* Background toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '2rem', padding: '0.75rem 1rem',
            background: '#111111', borderRadius: '10px', border: '1px solid #222222',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>White Background</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Standard white QR background</div>
            </div>
            <div style={{
              width: '44px', height: '24px', borderRadius: '100px',
              background: form.bgColor === '#ffffff' ? '#c8f135' : '#333',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }} onClick={() => setForm(p => ({ ...p, bgColor: p.bgColor === '#ffffff' ? 'transparent' : '#ffffff' }))}>
              <div style={{
                position: 'absolute', top: '2px',
                left: form.bgColor === '#ffffff' ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{
                flex: 2, padding: '0.875rem',
                background: loading ? '#333' : '#c8f135',
                color: loading ? '#666' : '#111',
                border: 'none', borderRadius: '9px',
                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
              }}>
              {loading ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQRModal;
