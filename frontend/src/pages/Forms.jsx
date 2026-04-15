import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { formAPI } from '../api';
import toast from 'react-hot-toast';

const Forms = () => {
  const [fmList, setFmList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await formAPI.getAll();
      setFmList(res.data.forms || []);
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this form and all its responses?')) return;
    try {
      await formAPI.delete(id);
      toast.success('Form deleted');
      loadForms();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success('Copied! 📋');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>Lead Forms</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.15rem', fontSize: '0.8rem' }}>Gather leads with high-converting forms.</p>
        </div>
        <button onClick={() => navigate('/account/forms/new')}
          style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', padding: '0.85rem 1.6rem',
                    borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
          + Create New Form
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>⏳ Fetching forms...</div>
      ) : fmList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📋</div>
          <h3 style={{ color: 'var(--text)', fontSize: '1.5rem' }}>No forms active</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Start capturing data by building your first lead generation form.</p>
          <button onClick={() => navigate('/account/forms/new')} 
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 800 }}>
            Create Form
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {fmList.map(form => (
            <div key={form.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
              transition: '0.2s', boxShadow: 'var(--shadow)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(217, 255, 0, 0.1)',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📋</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginTop: '2px' }}>
                      ⚡ {form.total_responses || 0} Responses
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.85rem 1rem', borderRadius: '12px',
                               marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--accent)',
                               wordBreak: 'break-all', fontWeight: 700, border: '1px solid var(--border)' }}>
                  {form.shortUrl}
                </div>

                {form.description && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', 
                               WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                    {form.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <button onClick={() => copyText(form.shortUrl)}
                  style={{ flex: 1, background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', 
                            padding: '0.65rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
                  📋 Copy Link
                </button>
                <button onClick={() => navigate(`/account/forms/responses/${form.id}`)}
                  style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', 
                            padding: '0.65rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  📊 Results
                </button>
                <button onClick={() => navigate(`/account/forms/edit/${form.id}`)}
                  style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', 
                            padding: '0.65rem', borderRadius: '10px', cursor: 'pointer' }} title="Edit Form">
                  ✏️
                </button>
                <button onClick={() => handleDelete(form.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', 
                            padding: '0.65rem', borderRadius: '10px', cursor: 'pointer' }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forms;
