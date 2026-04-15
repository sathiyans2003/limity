import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formAPI } from '../api';
import toast from 'react-hot-toast';

const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [fields, setFields] = useState([]); 
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const formRes = await formAPI.getAll();
      const currentForm = formRes.data.forms.find(f => f.id === parseInt(id));
      if (currentForm) {
        setFields(currentForm.fields || []);
      }
      const res = await formAPI.getResponses(id);
      setResponses(res.data.responses);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const exportCSV = () => {
    if (responses.length === 0) return toast.error('No data to export');

    // Use the FORM'S field configuration to define order
    const headers = ['Submitted At', 'IP Address', ...fields.map(f => f.label)];

    const csvContent = [
      headers.join(','),
      ...responses.map(r => {
        const row = [
          new Date(r.submitted_at).toLocaleString(),
          r.ip_address,
          ...fields.map(f => {
               // Map data using the technical field name (e.g. field_1)
               const val = r.response_data[f.name] || '';
               return `"${String(val).replace(/"/g, '""')}"`;
          })
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${id}.csv`;
    link.click();
    toast.success('Professional CSV Exported! 📥');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => navigate('/account/forms')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', padding: 0, fontWeight: 600 }}>
            ← Back to Forms
          </button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>Form Submissions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>View results mapped to your question format.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCSV} 
            style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', 
                      padding: '0.65rem 1.25rem', borderRadius: '10px', 
                      fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            📥 Export CSV
          </button>
          <div style={{ background: 'var(--card)', color: 'var(--text)', padding: '0.65rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem' }}>
            {responses.length} Submissions
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>⏳ Syncing with form format...</div>
      ) : responses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📭</div>
          <h3 style={{ color: 'var(--text)', fontSize: '1.25rem' }}>No responses yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {responses.map((resp, idx) => (
            <div key={resp.id} style={{ 
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', 
              padding: '1.25rem', boxShadow: 'var(--shadow)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem' }}># {responses.length - idx} SUBMISSION</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(resp.submitted_at).toLocaleString()}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {fields.map(f => (
                  <div key={f.id}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                      {resp.response_data[f.name] || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormResponses;
