import { useState, useEffect, useRef } from 'react';
import { linksAPI } from '../api';
import toast from 'react-hot-toast';

const expiryOptions = [
  { value: 'one_time', label: '⏱ One-Time (expires after 1st click)' },
  { value: 'unique_visit', label: '👤 Unique Visit (1 click per person)' },
  { value: 'time_based', label: '⏰ Time-Based (expires after duration)' },
  { value: 'click_limit', label: '🖱 Click Limit (max N clicks)' },
  { value: 'never', label: '♾️ Never Expire' },
];

const APP_DOMAIN = 'linky.smdigitalworks.com';

const CreateLinkModal = ({ onClose, onCreated, isPro }) => {
  const [form, setForm] = useState({
    originalUrl: '', title: '', expiryType: 'one_time',
    expiryValue: '', password: '', customSlug: '',
  });
  const [utm, setUtm] = useState({
    source: '', medium: '', campaign: '', content: '', term: '', id: '',
  });
  const [showUtm, setShowUtm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Slug availability state
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | { available, message }
  const debounceRef = useRef(null);

  // Debounced slug check
  useEffect(() => {
    const slug = form.customSlug.trim();
    if (!slug) { setSlugStatus(null); return; }

    setSlugStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await linksAPI.checkSlug(slug);
        setSlugStatus(res.data);
      } catch {
        setSlugStatus(null);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [form.customSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block submit if slug is taken
    if (form.customSlug.trim() && slugStatus && !slugStatus.available) {
      toast.error('Custom slug is not available. Please choose another.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.expiryValue) delete payload.expiryValue;
      if (!payload.password) delete payload.password;
      if (!payload.title) delete payload.title;
      if (!payload.customSlug) delete payload.customSlug;

      if (showUtm && Object.values(utm).some(v => v)) {
        payload.utm = utm;
      }

      const res = await linksAPI.create(payload);
      setCreatedLink(res.data.link);
      toast.success('Short link created! 🔗');
      onCreated(res.data.link);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create link';
      if (err.response?.data?.upgrade) {
        toast.error('Free plan limit reached! Upgrade to Pro 🚀');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    toast.success('Copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.875rem', background: '#141414',
    border: '1px solid #222222', borderRadius: '8px', color: 'white',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  const slugBorderColor = !form.customSlug.trim() ? '#222222'
    : slugStatus === 'checking' ? '#555555'
    : slugStatus?.available ? '#22c55e'
    : '#ef4444';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '16px',
                    width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white', margin: 0 }}>🔗 Create Short Link</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888888',
                                             fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        {createdLink ? (
          // ── Success State ──────────────────────────────────
          <div>
            <div style={{ textAlign: 'center', padding: '1rem 0', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>🎉</div>
              <h3 style={{ color: 'white', margin: '0.5rem 0' }}>Link Created!</h3>
            </div>
            <div style={{ background: '#141414', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#888888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Your short link:</div>
              <div style={{ color: '#c8f135', fontWeight: 600, wordBreak: 'break-all', fontSize: '1.1rem' }}>
                {createdLink.shortUrl}
              </div>
            </div>
            <div style={{ background: '#141414', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                           fontSize: '0.85rem', color: '#888888' }}>
              Expiry: <strong style={{ color: 'white' }}>
                {createdLink.expiryType === 'one_time' ? '⏱ One-Time click'
                  : createdLink.expiryType === 'unique_visit' ? '👤 1 click per person'
                  : createdLink.expiryType === 'never' ? '♾️ Never'
                  : createdLink.expiryType === 'click_limit' ? `🖱 ${createdLink.maxClicks} clicks`
                  : `⏰ ${createdLink.expiryValue}s`}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={copyLink} style={{ flex: 1, padding: '0.75rem', background: '#c8f135',
                                                  color: '#111', border: 'none', borderRadius: '8px',
                                                  fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button onClick={() => { setCreatedLink(null); setForm({ originalUrl: '', title: '', expiryType: 'one_time', expiryValue: '', password: '', customSlug: '' }); setSlugStatus(null); }}
                style={{ flex: 1, padding: '0.75rem', background: '#222222', color: 'white',
                          border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                + Create Another
              </button>
            </div>
          </div>
        ) : (
          // ── Form State ────────────────────────────────────
          <form onSubmit={handleSubmit}>
            {/* Long URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Long URL *
              </label>
              <input type="url" value={form.originalUrl} required
                onChange={e => setForm({ ...form, originalUrl: e.target.value })}
                placeholder="https://your-long-url.com/..." style={inputStyle} />
            </div>

            {/* Custom Slug */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                ✨ Custom Path <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span>
              </label>

              {/* Domain prefix + input row */}
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${slugBorderColor}`,
                             borderRadius: '8px', background: '#141414', overflow: 'hidden',
                             transition: 'border-color 0.2s' }}>
                <span style={{ padding: '0.65rem 0.75rem', color: '#555', fontSize: '0.82rem',
                                borderRight: '1px solid #222', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {APP_DOMAIN}/
                </span>
                <input
                  type="text"
                  value={form.customSlug}
                  onChange={e => setForm({ ...form, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="my-offer, sale2026..."
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, background: 'transparent', flex: 1 }}
                />
                {/* Status indicator */}
                {form.customSlug.trim() && (
                  <span style={{ padding: '0 0.75rem', fontSize: '1rem', flexShrink: 0 }}>
                    {slugStatus === 'checking' ? '⏳'
                      : slugStatus?.available ? '✅'
                      : slugStatus ? '❌' : ''}
                  </span>
                )}
              </div>

              {/* Status message */}
              {form.customSlug.trim() && slugStatus && slugStatus !== 'checking' && (
                <div style={{
                  marginTop: '6px', fontSize: '0.78rem', fontWeight: 600,
                  color: slugStatus.available ? '#22c55e' : '#ef4444',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {slugStatus.message}
                </div>
              )}
              {slugStatus === 'checking' && (
                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#888' }}>
                  Checking availability...
                </div>
              )}
              {!form.customSlug.trim() && (
                <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#444' }}>
                  Leave blank for a random short code. Only lowercase letters, numbers, hyphens allowed.
                </div>
              )}
            </div>

            {/* Title */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Title (optional)
              </label>
              <input type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="My payment link..." style={inputStyle} />
            </div>

            {/* Expiry */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                Expiry Type
              </label>
              <select value={form.expiryType} onChange={e => setForm({ ...form, expiryType: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {expiryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {form.expiryType === 'time_based' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  Expires after (seconds) — e.g. 300 = 5 minutes
                </label>
                <input type="number" value={form.expiryValue}
                  onChange={e => setForm({ ...form, expiryValue: e.target.value })}
                  placeholder="300" min="60" style={inputStyle} />
              </div>
            )}

            {form.expiryType === 'click_limit' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  Maximum Clicks
                </label>
                <input type="number" value={form.expiryValue}
                  onChange={e => setForm({ ...form, expiryValue: e.target.value })}
                  placeholder="10" min="1" style={inputStyle} />
              </div>
            )}

            {/* UTM Toggle */}
            <div style={{ marginBottom: '1rem' }}>
              <div onClick={() => setShowUtm(p => !p)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#141414', border: '1px solid #222222', borderRadius: '8px',
                          padding: '0.65rem 0.875rem', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.875rem', color: '#888888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Add UTMs to track web traffic
                </span>
                <div style={{ width: '40px', height: '22px', borderRadius: '100px',
                               background: showUtm ? '#c8f135' : '#222222',
                               position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                                 position: 'absolute', top: '3px',
                                 left: showUtm ? '21px' : '3px', transition: 'left 0.2s' }} />
                </div>
              </div>

              {showUtm && (
                <div style={{ marginTop: '0.75rem', background: '#141414', borderRadius: '10px',
                               border: '1px solid #222222', padding: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {[
                      { key: 'campaign', label: 'Campaign Name', placeholder: 'summer_sale', param: 'utm_campaign' },
                      { key: 'medium',   label: 'Medium',        placeholder: 'social, email', param: 'utm_medium' },
                      { key: 'source',   label: 'Source',        placeholder: 'facebook, newsletter', param: 'utm_source' },
                      { key: 'content',  label: 'Content',       placeholder: 'buy_now, logolink', param: 'utm_content' },
                      { key: 'term',     label: 'Term',          placeholder: 'snowboard', param: 'utm_term' },
                      { key: 'id',       label: 'Campaign ID',   placeholder: '1234', param: 'utm_id' },
                    ].map(({ key, label, placeholder, param }) => (
                      <div key={key}>
                        <label style={{ display: 'block', color: '#555555', fontSize: '0.72rem',
                                         marginBottom: '0.25rem', fontWeight: 500 }}>
                          {label} <span style={{ color: '#444444', fontStyle: 'italic' }}>{param}</span>
                        </label>
                        <input type="text" value={utm[key]}
                          onChange={e => setUtm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          style={{ width: '100%', padding: '0.5rem 0.65rem', background: '#111111',
                                    border: '1px solid #222222', borderRadius: '6px', color: 'white',
                                    fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                  {Object.values(utm).some(v => v) && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.65rem', background: '#111111',
                                   borderRadius: '6px', fontSize: '0.72rem', color: '#c8f135',
                                   wordBreak: 'break-all', lineHeight: 1.6 }}>
                      <span style={{ color: '#444444' }}>Preview: </span>
                      {form.originalUrl || 'https://yoururl.com'}
                      {utm.source   && `?utm_source=${utm.source}`}
                      {utm.medium   && `&utm_medium=${utm.medium}`}
                      {utm.campaign && `&utm_campaign=${utm.campaign}`}
                      {utm.content  && `&utm_content=${utm.content}`}
                      {utm.term     && `&utm_term=${utm.term}`}
                      {utm.id       && `&utm_id=${utm.id}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isPro && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888888', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  🔐 Password (Pro)
                </label>
                <input type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave empty for no password" style={inputStyle} />
              </div>
            )}

            {!isPro && (
              <div style={{ background: 'rgba(200, 241, 53, 0.1)', border: '1px solid #c8f135', borderRadius: '8px',
                             padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#c8f135' }}>
                🔐 Password protection is a <strong>Pro</strong> feature. Upgrade to unlock!
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: '0.75rem', background: '#222222', color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || (form.customSlug.trim() && slugStatus && !slugStatus.available)}
                style={{ flex: 2, padding: '0.75rem',
                          background: loading || (form.customSlug.trim() && slugStatus && !slugStatus.available) ? '#555' : '#c8f135',
                          color: loading || (form.customSlug.trim() && slugStatus && !slugStatus.available) ? '#888' : '#111',
                          border: 'none', borderRadius: '8px', fontWeight: 700,
                          cursor: loading || (form.customSlug.trim() && slugStatus && !slugStatus.available) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s' }}>
                {loading ? '⏳ Creating...' : '🔗 Create Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateLinkModal;
