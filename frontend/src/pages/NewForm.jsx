import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formAPI } from '../api';
import toast from 'react-hot-toast';

const NewForm = () => {
  const { id } = useParams(); // Detect if we are in Edit mode
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('Untitled form');
  const [description, setDescription] = useState('Form description (optional)');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      const loadForm = async () => {
        setFetching(true);
        try {
          const res = await formAPI.getAll();
          const form = res.data.forms.find(f => f.id === parseInt(id));
          if (form) {
            setTitle(form.title);
            setDescription(form.description || '');
            setFields(form.fields || []);
          }
        } catch {
          toast.error('Failed to load form for editing');
        } finally {
          setFetching(false);
        }
      };
      loadForm();
    }
  }, [id, isEdit]);

  const addField = (type, label) => {
    setFields([...fields, {
      id: Date.now(),
      name: `field_${fields.length + 1}`,
      label: label || 'Untitled Question',
      type: type || 'text',
      required: false,
      placeholder: ''
    }]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (fid, key, val) => {
    setFields(fields.map(f => f.id === fid ? { ...f, [key]: val } : f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fields.length === 0) return toast.error('Add at least one field');

    setLoading(true);
    try {
      if (isEdit) {
        await formAPI.update(id, { title, description, fields });
        toast.success('Form Updated! 📋');
      } else {
        await formAPI.create({ title, description, fields });
        toast.success('Form Published! 🚀');
      }
      navigate('/account/forms');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading form details...</div>;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
        
        {/* Header / Inline Editor */}
        <div style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/account/forms')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', padding: 0, fontWeight: 600 }}>
            ← Cancel
          </button>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text)',
              fontSize: '1.2rem', fontWeight: 800, width: '100%', outline: 'none',
              marginBottom: '0.4rem'
            }} 
            onFocus={(e) => e.target.value === 'Untitled form' && setTitle('')}
          />
          <input 
            type="text" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              fontSize: '0.85rem', width: '100%', outline: 'none'
            }} 
            onFocus={(e) => e.target.value === 'Form description (optional)' && setDescription('')}
          />
        </div>

        {/* Existing Fields Rendering */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {fields.map((field) => (
            <div key={field.id} style={{ 
              background: 'var(--card)', border: '1px solid var(--border)', 
              borderRadius: '16px', padding: '1.25rem', position: 'relative', boxShadow: 'var(--shadow)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  value={field.label} 
                  onChange={e => updateField(field.id, 'label', e.target.value)}
                  style={{ 
                    background: 'transparent', border: 'none', color: 'var(--accent)',
                    fontSize: '0.9rem', fontWeight: 700, flex: 1, outline: 'none'
                  }}
                />
                {field.required && <span style={{ color: '#ef4444', fontWeight: 900 }}>*</span>}
                <button onClick={() => removeField(field.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  disabled 
                  placeholder={field.type === 'textarea' ? 'Multi-line answer placeholder...' : `Enter ${field.label}...`}
                  style={{ 
                    flex: 1, padding: '0.65rem 1rem', background: 'var(--bg)', 
                    border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.85rem'
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={e => updateField(field.id, 'required', e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Required</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* The "Command" Area */}
        <div style={{ 
          border: '1px dashed var(--border)', borderRadius: '16px', padding: '1.5rem', 
          display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: 'var(--card)'
        }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--text-muted)',
            border: '1px solid var(--border)' 
          }}>+</div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type / to add a new row...</span>
        </div>

        {/* Action Chips */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '6rem' }}>
          <Chip label="Short answer" onClick={() => addField('text', 'Short Question')} />
          <Chip label="Long answer" onClick={() => addField('textarea', 'Long Question')} />
          <Chip label="Email" onClick={() => addField('email', 'Email Address')} />
          <Chip label="Phone" onClick={() => addField('tel', 'Phone Number')} />
          <Chip label="Number" onClick={() => addField('number', 'Quantity/Age')} />
        </div>

        {/* Action Footer */}
        <div style={{ 
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', pointerEvents: 'none'
        }}>
          <button 
           onClick={handleSubmit}
           disabled={loading || fields.length === 0}
           style={{ 
             background: fields.length > 0 ? 'var(--accent)' : 'var(--border)', 
             color: 'var(--accent-text)', border: 'none', padding: '0.85rem 2.2rem', 
             borderRadius: '12px', fontWeight: 800, fontSize: '1rem', 
             cursor: loading ? 'not-allowed' : 'pointer', pointerEvents: 'auto',
             boxShadow: fields.length > 0 ? 'var(--shadow)' : 'none'
           }}
          >
            {loading ? 'SAVING...' : isEdit ? 'UPDATE FORM →' : 'PUBLISH FORM →'}
          </button>
        </div>

      </div>
    </div>
  );
};

const Chip = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)',
      padding: '0.5rem 1.1rem', borderRadius: '100px', fontSize: '0.8rem',
      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
      transition: '0.2s', boxShadow: 'var(--shadow)'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
  >
    <span style={{ fontSize: '1.1rem' }}>+</span> {label}
  </button>
);

export default NewForm;
