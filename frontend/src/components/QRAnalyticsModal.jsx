import { useState, useEffect } from 'react';
import { qrAPI } from '../api';
import toast from 'react-hot-toast';

const QRAnalyticsModal = ({ qr, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await qrAPI.analytics(qr.id);
        setAnalytics(res.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally { setLoading(false); }
    };
    load();
  }, [qr.id]);

  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ', ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const statCard = (emoji, label, value, color = '#c8f135') => (
    <div style={{
      flex: 1, minWidth: '140px',
      background: '#111111', border: '1px solid #222222',
      borderRadius: '14px', padding: '1.25rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{emoji}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#0a0a0a', borderRadius: '16px', border: '1px solid #222222',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem', borderBottom: '1px solid #222222',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>
              📊 QR Analytics
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {qr.title || 'Untitled QR Code'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#1e293b', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: '#94a3b8',
          }}>✕</button>
        </div>

        <div style={{ padding: '1.5rem 2rem 2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* Stats Grid */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {statCard('📱', 'Total Scans', analytics.analytics?.totalScans ?? 0)}
                {statCard('📅', 'Created', fmtDate(analytics.analytics?.createdAt), '#94a3b8')}
              </div>

              {/* QR Info */}
              <div style={{
                background: '#111111', border: '1px solid #222222',
                borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                  QR CODE DETAILS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Title */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Title</span>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                      {analytics.qr?.title || 'Untitled'}
                    </span>
                  </div>

                  {/* Destination */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', flexShrink: 0 }}>Destination</span>
                    <a href={analytics.qr?.destination_url} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: '0.85rem', color: '#c8f135', fontWeight: 600,
                        textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                      {analytics.qr?.destination_url}
                    </a>
                  </div>

                  {/* Short URL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', flexShrink: 0 }}>Short URL</span>
                    <span style={{
                      fontSize: '0.85rem', color: '#22c55e', fontWeight: 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {analytics.qr?.shortUrl}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status</span>
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '100px',
                      background: analytics.qr?.is_active !== false ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: analytics.qr?.is_active !== false ? '#22c55e' : '#ef4444',
                    }}>
                      {analytics.qr?.is_active !== false ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button onClick={onClose}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: '#1e293b', color: '#e2e8f0',
                  border: 'none', borderRadius: '9px',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                }}>
                Close
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Failed to load analytics</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRAnalyticsModal;
