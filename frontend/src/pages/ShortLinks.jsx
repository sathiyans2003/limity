import { useState, useEffect, useCallback } from 'react';
import { linksAPI } from '../api';
import CreateLinkModal from '../components/CreateLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import toast from 'react-hot-toast';

const ShortLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await linksAPI.getAll({ page, limit: 10, search });
      setLinks(res.data.links);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load links'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try { await linksAPI.delete(id); toast.success('Link deleted'); loadLinks(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try { const r = await linksAPI.toggle(id); toast.success(r.data.message); loadLinks(); }
    catch { toast.error('Failed to toggle'); }
  };

  const copyText = (txt) => { navigator.clipboard.writeText(txt); toast.success('Copied! 📋'); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>Short Links</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>Optimized link management for conversions</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', padding: '0.85rem 1.6rem',
                    borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
          + New Link
        </button>
      </div>

      <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="🔍 Search and filter links..."
        style={{ width: '100%', padding: '1rem 1.5rem', marginBottom: '2rem', background: 'var(--card)',
                  border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', fontSize: '1rem', outline: 'none' }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>⏳ Synchronizing data...</div>
      ) : links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔗</div>
          <h3 style={{ color: 'var(--text)', fontSize: '1.5rem' }}>No data available</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Create your first shortened URL to see analytics here.</p>
          <button onClick={() => setShowCreate(true)} 
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 800 }}>
            Create First Link
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {links.map(link => (
              <LinkCard key={link.id} link={link} onCopy={() => copyText(link.shortUrl)}
                onEdit={() => setEditingLink(link)} onDelete={() => handleDelete(link.id)} onToggle={() => handleToggle(link.id)} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  style={{ padding: '0.6rem 1.2rem', background: page === i + 1 ? 'var(--accent)' : 'var(--card)',
                            color: page === i + 1 ? 'var(--accent-text)' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadLinks(); }} />}
      {editingLink && <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} onUpdated={() => { setEditingLink(null); loadLinks(); }} />}
    </div>
  );
};

const LinkCard = ({ link, onCopy, onEdit, onDelete, onToggle }) => {
  const isExpired = link.is_expired;
  const statusColor = isExpired ? '#ef4444' : link.is_active ? '#D9FF00' : '#f59e0b';
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem',
                  display: 'flex', alignItems: 'center', gap: '2rem', transition: '0.2s', boxShadow: 'var(--shadow)' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: statusColor, flexShrink: 0, boxShadow: `0 0 10px ${statusColor}` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {link.title && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{link.title}</div>}
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px' }}>{link.shortUrl}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.original_url}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span style={{ background: 'rgba(217,255,0,0.05)', color: 'var(--text)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          📊 <strong>{link.total_clicks}</strong> <span style={{fontSize: '0.75rem'}}>CLICKS</span>
        </span>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={onCopy} style={iconBtn()} title="Copy">📋</button>
          <button onClick={onEdit} style={iconBtn('rgba(37,99,235,0.1)', 'var(--text)')} title="Edit">✏️</button>
          <button onClick={onToggle} style={iconBtn()} title={link.is_active ? 'Pause' : 'Activate'}>{link.is_active ? '⏸' : '▶️'}</button>
          <button onClick={onDelete} style={iconBtn('rgba(239,68,68,0.1)', '#ef4444')} title="Delete">🗑</button>
        </div>
      </div>
    </div>
  );
};

const iconBtn = (bg = 'var(--bg)', color = 'var(--text)') => ({
  background: bg, color, border: '1px solid var(--border)',
  padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px'
});

export default ShortLinks;
