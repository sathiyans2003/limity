import { useState, useEffect, useRef } from 'react';
import { qrAPI, linksAPI } from '../api';
import toast from 'react-hot-toast';

/* Preset QR color dots (matching Limey.io palette) */
const PRESET_COLORS = [
  '#000000', // Black
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#22c55e', // Green
];

const QRModal = ({ onClose, onCreated }) => {
  const [form, setForm]       = useState({ title: '', destinationUrl: '', fgColor: '#000000', bgColor: '#ffffff' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  // Suggestion state
  const [allLinks, setAllLinks]             = useState([]);
  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx]     = useState(-1);
  const suggestRef = useRef(null);

  /* Load existing links for autocomplete */
  useEffect(() => {
    linksAPI.getAll({ limit: 100 }).then(res => {
      setAllLinks(res.data.links || []);
    }).catch(() => {});
  }, []);

  /* Close suggestions on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleUrlChange = (val) => {
    setForm(p => ({ ...p, destinationUrl: val }));
    setHighlightIdx(-1);
    if (val.trim().length > 0) {
      const filtered = allLinks.filter(l =>
        l.shortUrl?.toLowerCase().includes(val.toLowerCase()) ||
        l.original_url?.toLowerCase().includes(val.toLowerCase()) ||
        (l.title || '').toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // Show recent links on focus empty
      setSuggestions(allLinks.slice(0, 6));
      setShowSuggestions(allLinks.length > 0);
    }
  };

  const handleUrlFocus = () => {
    if (!form.destinationUrl) {
      setSuggestions(allLinks.slice(0, 6));
      setShowSuggestions(allLinks.length > 0);
    }
  };

  const selectSuggestion = (link) => {
    setForm(p => ({ ...p, destinationUrl: link.shortUrl || link.original_url, title: p.title || link.title || '' }));
    setShowSuggestions(false);
  };

  const handleUrlKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(p => Math.min(p + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlightIdx(p => Math.max(p - 1, -1)); }
    if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIdx]);
    }
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await qrAPI.create(form);
      setResult(res.data.qr);
      toast.success('QR Code created! 📱');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create QR');
    } finally { setLoading(false); }
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = result.qrBase64;
    a.download = `${result.title || 'qrcode'}.png`;
    a.click();
    toast.success('Downloaded! 📥');
  };

  /* Styles */
  const inp = {
    width: '100%', padding: '0.75rem 1rem',
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: '9px', color: '#111', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px',
        width: '100%', maxWidth: '780px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
        display: 'flex', overflow: 'hidden', maxHeight: '92vh',
      }}>

        {/* ── LEFT: Form ─────────────────────── */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111' }}>Edit your QR Code</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#888' }}>Customize and download your QR code</p>
            </div>
            <button onClick={onClose} style={{
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#555',
            }}>✕</button>
          </div>

          {result ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#111' }}>QR Code Created!</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Share this link or download the QR image
              </p>
              <div style={{ background: '#f3f4f6', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '4px' }}>Short link:</div>
                <div style={{ color: '#1e40af', fontWeight: 700, wordBreak: 'break-all' }}>{result.shortUrl}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={downloadQR}
                  style={{ flex: 1, padding: '0.75rem', background: '#c8f135', color: '#111', border: 'none', borderRadius: '9px', fontWeight: 800, cursor: 'pointer' }}>
                  📥 Download PNG
                </button>
                <button onClick={() => { setResult(null); setForm({ title: '', destinationUrl: '', fgColor: '#000000', bgColor: '#ffffff' }); }}
                  style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#333', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer' }}>
                  + New QR
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* Your Link field with suggestions */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>
                  Your Link
                </label>
                <div ref={suggestRef} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', color: '#9ca3af', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center',
                    }}>🔗</span>
                    <input
                      type="text"
                      value={form.destinationUrl}
                      required
                      onChange={e => handleUrlChange(e.target.value)}
                      onFocus={handleUrlFocus}
                      onKeyDown={handleUrlKeyDown}
                      placeholder="Paste a URL or search your links..."
                      style={{ ...inp, paddingLeft: '2.25rem', borderColor: showSuggestions ? '#c8f135' : '#e5e7eb' }}
                      onFocus2={e => e.target.style.borderColor = '#c8f135'}
                      onBlur={e => { setTimeout(() => setShowSuggestions(false), 150); }}
                    />
                  </div>

                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                      background: '#fff', border: '1.5px solid #e5e7eb',
                      borderRadius: '10px', overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
                    }}>
                      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                        SUGGESTIONS
                      </div>
                      {suggestions.map((link, i) => (
                        <div
                          key={link.id}
                          onMouseDown={() => selectSuggestion(link)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '0.7rem 0.875rem',
                            background: i === highlightIdx ? '#f0fdf0' : 'transparent',
                            cursor: 'pointer',
                            borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fdf0'}
                          onMouseLeave={e => e.currentTarget.style.background = i === highlightIdx ? '#f0fdf0' : 'transparent'}
                        >
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: '#f3f4f6', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0,
                          }}>🔗</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111',
                                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {link.title || 'Link: ' + (link.short_code || '')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af',
                                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {link.shortUrl}
                            </div>
                          </div>
                          <span style={{ color: '#c8f135', fontSize: '0.7rem', fontWeight: 700, background: '#111', padding: '2px 6px', borderRadius: '4px' }}>
                            USE
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>
                  Title <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="My QR Code"
                  style={inp}
                />
              </div>

              {/* QR Color / Preset Dots */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#333', marginBottom: '0.75rem' }}>
                  QR Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, fgColor: color }))}
                      title={color}
                      style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: color, border: form.fgColor === color
                          ? '3px solid #111' : '3px solid transparent',
                        boxShadow: form.fgColor === color
                          ? '0 0 0 2px #c8f135' : '0 1px 3px rgba(0,0,0,0.2)',
                        cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                      }}
                    />
                  ))}
                  {/* Custom color picker */}
                  <label style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                    border: '2px solid #e5e7eb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} title="Custom color">
                    <span style={{ fontSize: '0.9rem', zIndex: 1 }}>+</span>
                    <input type="color" value={form.fgColor}
                      onChange={e => setForm(p => ({ ...p, fgColor: e.target.value }))}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </label>
                </div>
              </div>

              {/* Background toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>White Background</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Standard white QR background</div>
                </div>
                <div style={{
                  width: '44px', height: '24px', borderRadius: '100px',
                  background: form.bgColor === '#ffffff' ? '#c8f135' : '#e5e7eb',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }} onClick={() => setForm(p => ({ ...p, bgColor: p.bgColor === '#ffffff' ? 'transparent' : '#ffffff' }))}>
                  <div style={{
                    position: 'absolute', top: '2px',
                    left: form.bgColor === '#ffffff' ? '22px' : '2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '0.875rem', background: '#f3f4f6', color: '#555', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{
                    flex: 2, padding: '0.875rem',
                    background: loading ? '#e5e7eb' : '#c8f135',
                    color: loading ? '#999' : '#111',
                    border: 'none', borderRadius: '9px',
                    fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                  }}>
                  {loading ? '⏳ Generating...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── RIGHT: QR Preview ───────────────── */}
        <div style={{
          width: '220px', flexShrink: 0,
          background: '#f9fafb', borderLeft: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          padding: '2rem 1rem',
        }}>
          {/* QR Preview */}
          <div style={{
            width: '160px', height: '160px', borderRadius: '12px',
            background: form.bgColor || '#fff',
            border: '2px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {result?.qrBase64 ? (
              <img src={result.qrBase64} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              /* Static placeholder QR grid */
              <QRPlaceholder color={form.fgColor} bg={form.bgColor} />
            )}
          </div>

          {/* Download button */}
          {result && (
            <button onClick={downloadQR}
              style={{
                width: '100%', padding: '0.65rem', background: '#c8f135',
                border: 'none', borderRadius: '9px', fontWeight: 800,
                color: '#111', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
              📥 Download
            </button>
          )}

          <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center' }}>
            Scan to preview your QR code
          </p>
        </div>
      </div>
    </div>
  );
};

/* Simple QR placeholder graphic */
const QRPlaceholder = ({ color = '#000', bg = '#fff' }) => (
  <svg viewBox="0 0 100 100" width="130" height="130">
    {/* Top-left finder */}
    <rect x="5" y="5" width="30" height="30" rx="3" fill={color}/>
    <rect x="10" y="10" width="20" height="20" rx="2" fill={bg}/>
    <rect x="13" y="13" width="14" height="14" rx="1" fill={color}/>
    {/* Top-right finder */}
    <rect x="65" y="5" width="30" height="30" rx="3" fill={color}/>
    <rect x="70" y="10" width="20" height="20" rx="2" fill={bg}/>
    <rect x="73" y="13" width="14" height="14" rx="1" fill={color}/>
    {/* Bottom-left finder */}
    <rect x="5" y="65" width="30" height="30" rx="3" fill={color}/>
    <rect x="10" y="70" width="20" height="20" rx="2" fill={bg}/>
    <rect x="13" y="73" width="14" height="14" rx="1" fill={color}/>
    {/* Data pattern */}
    {[
      [42,5],[48,5],[54,5],[42,11],[54,11],[42,17],[48,17],
      [5,42],[11,42],[17,42],[5,54],[17,54],[5,60],
      [42,42],[54,42],[48,48],[42,54],[54,54],
      [60,60],[66,60],[72,60],[60,66],[72,66],[60,72],[66,72],[72,72],
      [42,66],[48,72],[54,66],
    ].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width="5" height="5" fill={color}/>
    ))}
  </svg>
);

export default QRModal;
