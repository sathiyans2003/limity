import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { linksAPI, paymentAPI, qrAPI, vcardAPI, formAPI } from '../api';
import CreateLinkModal from '../components/CreateLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import QRModal from '../components/QRModal';
import EditQRModal from '../components/EditQRModal';
import QRAnalyticsModal from '../components/QRAnalyticsModal';
import VCardModal from '../components/VCardModal';
import FormModal from '../components/FormModal';

import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Action button helper
───────────────────────────────────────────── */
const actionBtn = (bg = '#334155') => ({
  background: bg, border: '1px solid rgba(255,255,255,0.08)',
  color: 'white', padding: '0.4rem 0.65rem',
  borderRadius: '7px', cursor: 'pointer', fontSize: '0.88rem',
  transition: 'opacity 0.15s',
});

/* ─────────────────────────────────────────────
   NAV ITEMS config
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { key: 'links', icon: '🔗', label: 'Links' },
  { key: 'qrcodes', icon: '📱', label: 'QR Codes' },
  { key: 'vcards', icon: '👤', label: 'vCards' },
  { key: 'forms', icon: '📋', label: 'Forms' },
];

/* ════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════ */
const Dashboard = () => {
  const { user, logout, updateUserPlan } = useAuth();
  const navigate = useNavigate();

  // ── Tab state ──────────────────────────────
  const [activeTab, setActiveTab] = useState('links');

  // ── Links state ────────────────────────────
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // ── QR state ───────────────────────────────
  const [qrList, setQrList] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);

  // ── vCard state ────────────────────────────
  const [vcList, setVcList] = useState([]);
  const [vcLoading, setVcLoading] = useState(false);

  // ── Form state ─────────────────────────────
  const [fmList, setFmList] = useState([]);
  const [fmLoading, setFmLoading] = useState(false);

  // ── Modal state ────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [analyticsQR, setAnalyticsQR] = useState(null);
  const [showVCard, setShowVCard] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  /* ── Loaders ──────────────────────────────── */
  const loadLinks = useCallback(async () => {
    setLinksLoading(true);
    try {
      const res = await linksAPI.getAll({ page, limit: 10, search });
      setLinks(res.data.links);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load links'); }
    finally { setLinksLoading(false); }
  }, [page, search]);

  const loadQR = useCallback(async () => {
    setQrLoading(true);
    try { const res = await qrAPI.getAll(); setQrList(res.data.qrs || []); }
    catch { toast.error('Failed to load QR codes'); }
    finally { setQrLoading(false); }
  }, []);

  const loadVC = useCallback(async () => {
    setVcLoading(true);
    try { const res = await vcardAPI.getAll(); setVcList(res.data.vcards || []); }
    catch { toast.error('Failed to load vCards'); }
    finally { setVcLoading(false); }
  }, []);

  const loadForms = useCallback(async () => {
    setFmLoading(true);
    try { const res = await formAPI.getAll(); setFmList(res.data.forms || []); }
    catch { toast.error('Failed to load forms'); }
    finally { setFmLoading(false); }
  }, []);

  /* ── Tab switch loads ─────────────────────── */
  useEffect(() => { loadLinks(); }, [loadLinks]);

  useEffect(() => {
    if (activeTab === 'qrcodes') loadQR();
    if (activeTab === 'vcards') loadVC();
    if (activeTab === 'forms') loadForms();
  }, [activeTab]);

  /* ── Handlers ─────────────────────────────── */
  const handleDeleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try { await linksAPI.delete(id); toast.success('Link deleted'); loadLinks(); }
    catch { toast.error('Failed to delete'); }
  };
  const handleToggleLink = async (id) => {
    try { const r = await linksAPI.toggle(id); toast.success(r.data.message); loadLinks(); }
    catch { toast.error('Failed to toggle'); }
  };
  const handleDeleteQR = async (id) => {
    if (!window.confirm('Delete this QR Code?')) return;
    try { await qrAPI.delete(id); toast.success('QR deleted'); loadQR(); }
    catch { toast.error('Failed to delete'); }
  };
  const handleDeleteVC = async (id) => {
    if (!window.confirm('Delete this vCard?')) return;
    try { await vcardAPI.delete(id); toast.success('vCard deleted'); loadVC(); }
    catch { toast.error('Failed to delete'); }
  };
  const handleDeleteForm = async (id) => {
    if (!window.confirm('Delete this form?')) return;
    try { await formAPI.delete(id); toast.success('Form deleted'); loadForms(); }
    catch { toast.error('Failed to delete'); }
  };
  const copyText = (txt) => { navigator.clipboard.writeText(txt); toast.success('Copied! 📋'); };

  const handleUpgrade = async () => {
    setPayLoading(true);
    try {
      const res = await paymentAPI.createOrder();
      const { order, key, user: u, amount } = res.data;
      const options = {
        key, amount, currency: 'INR', name: 'Limitly',
        description: 'Pro Plan Subscription', order_id: order.id,
        handler: async (response) => {
          try { await paymentAPI.verify(response); toast.success('🎉 Upgraded to Pro!'); updateUserPlan('pro'); }
          catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: u.name, email: u.email }, theme: { color: '#6366f1' },
      };
      const rzp = new window.Razorpay(options); rzp.open();
    } catch { toast.error('Payment failed to load'); }
    finally { setPayLoading(false); }
  };

  /* ── "+" button per tab ───────────────────── */
  const handleCreate = () => {
    if (activeTab === 'links') setShowCreate(true);
    if (activeTab === 'qrcodes') setShowQR(true);
    if (activeTab === 'vcards') setShowVCard(true);
    if (activeTab === 'forms') setShowForm(true);
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div style={{
      background: '#080808', minHeight: '100vh', color: 'white',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>

      {/* ─── TOP NAVBAR ──────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '60px',
        background: '#080808',
        borderBottom: '1px solid #1e293b',
        position: 'sticky', top: 0, zIndex: 200,
      }}>

        {/* LEFT: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
          <div style={{
            fontSize: '1.2rem', fontWeight: 900, color: '#c8f135',
            letterSpacing: '-0.5px', cursor: 'default', userSelect: 'none'
          }}>
            🔗 Limitly
          </div>

          {/* CENTER: Nav Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none',
                    background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent',
                    color: isActive ? '#c8f135' : '#94a3b8',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem', cursor: 'pointer',
                    borderBottom: isActive ? '2px solid #c8f135' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Actions + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>

          {/* Upgrade / Pro badge */}
          {user?.plan === 'free' ? (
            <button onClick={() => navigate('/upgrade')}
              style={{
                background: '#c8f135',
                color: '#111', border: 'none', padding: '0.4rem 1rem',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.8rem', whiteSpace: 'nowrap',
              }}>
              ⚡ Upgrade Pro
            </button>
          ) : (
            <span style={{
              background: 'rgba(200,241,53,0.15)', color: '#c8f135',
              padding: '0.3rem 0.75rem', borderRadius: '100px',
              fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(200,241,53,0.3)'
            }}>
              ⚡ Pro
            </span>
          )}

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#111111', border: '1px solid #222222',
                borderRadius: '10px', padding: '0.4rem 0.75rem',
                cursor: 'pointer', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#c8f135',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#111', flexShrink: 0,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>▼</span>
            </button>

            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                  background: '#111111', border: '1px solid #222222',
                  borderRadius: '12px', padding: '0.5rem', minWidth: '200px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ padding: '0.5rem 0.875rem 0.75rem', borderBottom: '1px solid #222222' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{user?.email}</div>
                    <div style={{
                      display: 'inline-block', marginTop: '6px', padding: '2px 8px',
                      background: user?.plan === 'pro' ? 'rgba(200,241,53,0.15)' : 'rgba(100,116,139,0.2)',
                      color: user?.plan === 'pro' ? '#c8f135' : '#94a3b8',
                      borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {user?.plan === 'pro' ? '⚡ Pro Plan' : '🆓 Free Plan'}
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '0.6rem 0.875rem', background: 'none',
                      border: 'none', color: '#ef4444', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '0.875rem', marginTop: '4px',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── PAGE CONTENT ────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem' }}>

        {/* ── LINKS TAB ──────────────────────────── */}
        {activeTab === 'links' && (
          <>
            <PageHeader
              icon="🔗"
              title="Links"
              subtitle={user?.plan === 'free'
                ? `Free Plan — 5 links/day · Total: ${pagination.total || 0}`
                : `Pro Plan — Unlimited · Total: ${pagination.total || 0}`}
              onCreate={() => setShowCreate(true)}
              createLabel="New Link"
            />
            {/* Search */}
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="🔍 Search links..."
              style={searchStyle}
            />
            {linksLoading ? <LoadingState /> : links.length === 0 ? (
              <EmptyState icon="🔗" title="No links yet" sub="Create your first short link!" onCreate={() => setShowCreate(true)} cta="New Link" />
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {links.map(link => (
                    <LinkCard key={link.id} link={link}
                      onDelete={() => handleDeleteLink(link.id)}
                      onToggle={() => handleToggleLink(link.id)}
                      onCopy={() => copyText(`${window.location.origin.replace('3000', '5000')}/${link.short_code}`)}
                      onEdit={() => setEditingLink(link)} />
                  ))}
                </div>
                {pagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <button key={i + 1} onClick={() => setPage(i + 1)}
                        style={{
                          padding: '0.45rem 0.875rem', background: page === i + 1 ? '#c8f135' : '#111111',
                          color: page === i + 1 ? '#111' : 'white', border: '1px solid #222222', borderRadius: '6px', cursor: 'pointer'
                        }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── QR CODES TAB ───────────────────────── */}
        {activeTab === 'qrcodes' && (
          <>
            <PageHeader icon="📱" title="QR Codes" subtitle="Scannable QR codes that redirect anywhere"
              onCreate={() => setShowQR(true)} createLabel="New QR Code" />
            {qrLoading ? <LoadingState /> : qrList.length === 0 ? (
              <EmptyState icon="📱" title="No QR Codes yet" sub="Create your first QR Code!" onCreate={() => setShowQR(true)} cta="New QR Code" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {qrList.map(qr => (
                  <QRCard key={qr.id} qr={qr}
                    onCopy={() => copyText(`${window.location.origin.replace('3000', '5000')}/qr/${qr.short_code}`)}
                    onDelete={() => handleDeleteQR(qr.id)}
                    onEdit={() => setEditingQR(qr)}
                    onAnalytics={() => setAnalyticsQR(qr)}
                  />
                ))}
              </div>
            )}
          </>
        )}


        {/* ── VCARDS TAB ─────────────────────────── */}
        {activeTab === 'vcards' && (
          <>
            <PageHeader icon="👤" title="vCards" subtitle="Digital contact cards that download as .vcf"
              onCreate={() => setShowVCard(true)} createLabel="New vCard" />
            {vcLoading ? <LoadingState /> : vcList.length === 0 ? (
              <EmptyState icon="👤" title="No vCards yet" sub="Create your first digital contact card!" onCreate={() => setShowVCard(true)} cta="New vCard" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {vcList.map(vc => (
                  <div key={vc.id} style={{
                    background: '#111111', border: '1px solid #222222',
                    borderRadius: '14px', padding: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: '#c8f135',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 800, color: '#111', flexShrink: 0,
                      }}>
                        {vc.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{vc.full_name}</div>
                        <div style={{ color: '#888888', fontSize: '0.8rem' }}>{vc.job_title}{vc.company ? ` · ${vc.company}` : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #222222', paddingTop: '0.75rem' }}>
                      <button onClick={() => copyText(`${window.location.origin.replace('3000', '5000')}/vc/${vc.short_code}`)}
                        style={{ ...actionBtn(), flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                        🔗 Copy Link
                      </button>
                      <button onClick={() => handleDeleteVC(vc.id)} style={actionBtn('#450a0a')}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FORMS TAB ──────────────────────────── */}
        {activeTab === 'forms' && (
          <>
            <PageHeader icon="📋" title="Forms" subtitle="Collect responses from anyone with a shareable link"
              onCreate={() => setShowForm(true)} createLabel="New Form" />
            {fmLoading ? <LoadingState /> : fmList.length === 0 ? (
              <EmptyState icon="📋" title="No forms yet" sub="Create your first form!" onCreate={() => setShowForm(true)} cta="New Form" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {fmList.map(fm => (
                  <div key={fm.id} style={{
                    background: '#111111', border: '1px solid #222222',
                    borderRadius: '14px', padding: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: 'rgba(200,241,53,0.15)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                      }}>📋</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: '0.9rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {fm.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#888888', marginTop: '2px' }}>
                          📊 {fm.total_responses || 0} responses
                        </div>
                      </div>
                    </div>
                    {fm.description && (
                      <p style={{
                        margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#555555',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {fm.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #222222', paddingTop: '0.75rem' }}>
                      <button onClick={() => copyText(`${window.location.origin.replace('3000', '5000')}/f/${fm.short_code}`)}
                        style={{ ...actionBtn(), flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                        🔗 Copy Link
                      </button>
                      <button onClick={() => handleDeleteForm(fm.id)} style={actionBtn('#450a0a')}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}


      </div>

      {/* ─── MODALS ──────────────────────────────── */}
      {showCreate && (
        <CreateLinkModal isPro={user?.plan === 'pro'}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadLinks(); }} />
      )}
      {editingLink && (
        <EditLinkModal link={editingLink} isPro={user?.plan === 'pro'}
          onClose={() => setEditingLink(null)}
          onUpdated={() => { setEditingLink(null); loadLinks(); }} />
      )}
      {showQR && (
        <QRModal onClose={() => setShowQR(false)}
          onCreated={() => { setShowQR(false); loadQR(); }} />
      )}
      {editingQR && (
        <EditQRModal qr={editingQR}
          onClose={() => setEditingQR(null)}
          onUpdated={() => { setEditingQR(null); loadQR(); }} />
      )}
      {analyticsQR && (
        <QRAnalyticsModal qr={analyticsQR}
          onClose={() => setAnalyticsQR(null)} />
      )}
      {showVCard && (
        <VCardModal onClose={() => setShowVCard(false)}
          onCreated={() => { setShowVCard(false); loadVC(); }} />
      )}
      {showForm && (
        <FormModal onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); loadForms(); }} />
      )}

    </div>
  );
};

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */
const searchStyle = {
  width: '100%', padding: '0.75rem 1rem', marginBottom: '1.25rem',
  background: '#111111', border: '1px solid #222222', borderRadius: '10px',
  color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
};

const PageHeader = ({ icon, title, subtitle, onCreate, createLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
    <div>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>{icon}</span> {title}
      </h1>
      {subtitle && <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{subtitle}</p>}
    </div>
    {onCreate && (
      <button onClick={onCreate}
        style={{
          background: '#c8f135', color: '#111',
          border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px',
          fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
        }}>
        + {createLabel}
      </button>
    )}
  </div>
);

const LoadingState = () => (
  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ Loading...</div>
);

const EmptyState = ({ icon, title, sub, onCreate, cta }) => (
  <div style={{
    textAlign: 'center', padding: '4rem 2rem', background: '#111111',
    borderRadius: '16px', border: '1px solid #222222'
  }}>
    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{ color: '#888888', margin: '0 0 0.5rem' }}>{title}</h3>
    <p style={{ color: '#444444', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>{sub}</p>
    {onCreate && (
      <button onClick={onCreate}
        style={{
          background: '#c8f135', color: '#111', border: 'none',
          padding: '0.65rem 1.5rem', borderRadius: '10px',
          fontWeight: 700, cursor: 'pointer'
        }}>
        + {cta}
      </button>
    )}
  </div>
);

const LinkCard = ({ link, onDelete, onToggle, onCopy, onEdit }) => {
  const isExpired = link.isExpired || link.is_expired;
  const statusColor = isExpired ? '#ef4444' : link.is_active ? '#22c55e' : '#f59e0b';
  const statusLabel = isExpired ? 'Expired' : link.is_active ? 'Active' : 'Paused';

  return (
    <div style={{
      background: '#111111', border: '1px solid #222222', borderRadius: '12px',
      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: '200px' }}>
        {link.title && <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{link.title}</div>}
        <div style={{ color: '#c8f135', fontWeight: 700, fontSize: '0.9rem' }}>{link.shortUrl}</div>
        <div style={{
          color: '#444444', fontSize: '0.78rem', marginTop: '2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px'
        }}>
          {link.original_url}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#94a3b8', alignItems: 'center' }}>
        <span style={{ color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
        <span>🖱 {link.total_clicks || 0} clicks</span>
        <span style={{ color: '#475569' }}>
          {link.expiry_type === 'one_time' ? '⏱ One-Time'
            : link.expiry_type === 'unique_visit' ? '👤 Per Person'
              : link.expiry_type === 'never' ? '♾️ Never'
                : link.expiry_type === 'click_limit' ? `🖱 Max ${link.max_clicks}`
                  : '⏰ Timed'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onCopy} title="Copy" style={actionBtn()}>📋</button>
        <button onClick={onEdit} title="Edit" style={actionBtn('#1e3a5f')}>✏️</button>
        {!isExpired && (
          <button onClick={onToggle} title={link.is_active ? 'Pause' : 'Activate'}
            style={actionBtn()}>
            {link.is_active ? '⏸' : '▶️'}
          </button>
        )}
        <button onClick={onDelete} title="Delete" style={actionBtn('#450a0a')}>🗑</button>
      </div>
    </div>
  );
};

const QRCard = ({ qr, onCopy, onDelete, onEdit, onAnalytics }) => {
  const [tagHover, setTagHover] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ', ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const iconBtnStyle = (id) => ({
    background: hoveredBtn === id ? '#f3f4f6' : 'transparent',
    border: 'none',
    borderRadius: '7px',
    padding: '6px 8px',
    cursor: 'pointer',
    color: id === 'delete' ? (hoveredBtn === id ? '#ef4444' : '#9ca3af') : (hoveredBtn === id ? '#374151' : '#9ca3af'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    fontSize: '0.8rem',
  });

  const handleDownload = () => {
    if (!qr.qrBase64) return;
    const a = document.createElement('a');
    a.href = qr.qrBase64;
    a.download = `qr-${qr.short_code || 'code'}.png`;
    a.click();
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)'}
    >
      {/* QR Image */}
      {qr.qrBase64 ? (
        <img src={qr.qrBase64} alt="QR Code"
          style={{
            width: '90px', height: '90px', flexShrink: 0,
            borderRadius: '10px', background: '#fff',
            border: '2px solid #e5e7eb',
          }} />
      ) : (
        <div style={{
          width: '90px', height: '90px', flexShrink: 0,
          borderRadius: '10px', background: '#f3f4f6',
          border: '2px dashed #d1d5db',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}>📱</div>
      )}

      {/* Right content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Date & Time */}
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px', fontWeight: 500 }}>
          {fmtDate(qr.created_at)}
        </div>

        {/* Title */}
        {qr.title && (
          <div style={{
            fontSize: '0.82rem', color: '#374151', fontWeight: 600, marginBottom: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {qr.title}
          </div>
        )}

        {/* URL */}
        <a
          href={qr.destination_url} target="_blank" rel="noreferrer"
          title={qr.destination_url}
          style={{
            display: 'block', color: '#16a34a', fontWeight: 700, fontSize: '0.875rem',
            textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', marginBottom: '4px',
          }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          {qr.destination_url}
        </a>

        {/* Add tag */}
        <button
          onClick={() => { }}
          style={{
            background: 'none', border: 'none', padding: 0,
            color: tagHover ? '#16a34a' : '#6b7280',
            fontSize: '0.775rem', cursor: 'pointer',
            fontWeight: 500, marginBottom: '10px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={() => setTagHover(true)}
          onMouseLeave={() => setTagHover(false)}
        >
          + Add tag...
        </button>

        {/* Scans badge */}
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '8px' }}>
          📊 {qr.total_scans || 0} scans
        </div>

        {/* Action icons row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          borderTop: '1px solid #f3f4f6', paddingTop: '8px',
        }}>
          {/* Edit */}
          <button title="Edit" onClick={onEdit} style={iconBtnStyle('edit')}
            onMouseEnter={() => setHoveredBtn('edit')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Analytics */}
          <button title="Analytics" onClick={onAnalytics} style={iconBtnStyle('analytics')}
            onMouseEnter={() => setHoveredBtn('analytics')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>

          {/* Copy link */}
          <button title="Copy link" onClick={onCopy} style={iconBtnStyle('copy')}
            onMouseEnter={() => setHoveredBtn('copy')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/* Delete */}
          <button title="Delete" onClick={onDelete} style={iconBtnStyle('delete')}
            onMouseEnter={() => setHoveredBtn('delete')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>

          {/* Download */}
          <button title="Download QR" onClick={handleDownload} style={iconBtnStyle('download')}
            onMouseEnter={() => setHoveredBtn('download')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
