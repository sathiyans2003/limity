import { useState, useRef } from 'react';
import { formAPI } from '../api';
import toast from 'react-hot-toast';

/* Field type options */
const QUICK_ADD = [
  { type: 'text',     icon: '—', label: 'Short answer' },
  { type: 'textarea', icon: '≡', label: 'Long answer'  },
  { type: 'email',    icon: '@', label: 'Email'        },
  { type: 'tel',      icon: '📞', label: 'Phone'       },
  { type: 'number',   icon: '#', label: 'Number'       },
  { type: 'date',     icon: '📅', label: 'Date'        },
];

const genId = () => `field_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

const FormModal = ({ onClose, onCreated }) => {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields]           = useState([]);
  const [activeField, setActiveField] = useState(null);   // id of focused field
  const [loading, setLoading]         = useState(false);
  const [published, setPublished]     = useState(false);  // draft vs publish
  const [result, setResult]           = useState(null);
  const [copied, setCopied]           = useState(false);
  const addRowRef = useRef(null);

  /* Add a new field */
  const addField = (type) => {
    const labelMap = { text: 'Short Answer', textarea: 'Long Answer', email: 'Email', tel: 'Phone', number: 'Number', date: 'Date' };
    const id = genId();
    const newField = { id, name: id, label: labelMap[type] || 'New Field', type, placeholder: '', required: false };
    setFields(p => [...p, newField]);
    setActiveField(id);
  };

  const updateField = (id, key, val) =>
    setFields(p => p.map(f => f.id === id ? { ...f, [key]: val } : f));

  const removeField = (id) => {
    setFields(p => p.filter(f => f.id !== id));
    if (activeField === id) setActiveField(null);
  };

  const moveField = (id, dir) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr;
    });
  };

  /* Save or Publish */
  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error('Please add a form title');
      return;
    }
    if (fields.length === 0) {
      toast.error('Add at least one field!');
      return;
    }
    setLoading(true);
    setPublished(publish);
    try {
      const res = await formAPI.create({ title, description, fields });
      setResult(res.data.form);
      toast.success(publish ? '🚀 Form published!' : '📝 Draft saved!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save form');
    } finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true); toast.success('Copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const TYPE_ICON = { text: '—', textarea: '≡', email: '@', tel: '📞', number: '#', date: '📅' };

  /* ════════════════════════════════════════
     SUCCESS STATE
  ════════════════════════════════════════ */
  if (result) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#fff',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', height: '56px',
          borderBottom: '1px solid #e5e7eb', background: '#fff',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#333' }}>Form Builder</div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.4rem 0.875rem', cursor: 'pointer', color: '#555', fontWeight: 600 }}>
            ✕ Close
          </button>
        </div>

        {/* Success content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
              {published ? 'Form Published!' : 'Draft Saved!'}
            </h2>
            <p style={{ color: '#888', margin: '0 0 2rem', fontSize: '0.95rem' }}>
              {result.title} · {fields.length} fields
            </p>

            <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '5px', fontWeight: 600, letterSpacing: '0.5px' }}>SHARE LINK</div>
              <div style={{ color: '#1e40af', fontWeight: 700, wordBreak: 'break-all', fontSize: '0.95rem' }}>
                {result.shortUrl}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={copyLink}
                style={{ flex: 1, padding: '0.875rem', background: '#c8f135', color: '#111', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button onClick={() => { setResult(null); setTitle(''); setDescription(''); setFields([]); }}
                style={{ flex: 1, padding: '0.875rem', background: '#f3f4f6', color: '#333', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                + New Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     EDITOR STATE
  ════════════════════════════════════════ */
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── TOP BAR ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '56px',
        borderBottom: '1px solid #e5e7eb', background: '#fff',
        flexShrink: 0,
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '100%' }}>
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            padding: '0 0.5rem', fontWeight: 700, fontSize: '0.9rem',
            color: '#111', borderBottom: '2px solid #c8f135',
          }}>
            Editor
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button onClick={onClose}
            style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '7px', fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button onClick={() => handleSave(false)} disabled={loading}
            style={{ padding: '0.45rem 1rem', background: '#f3f4f6', color: '#333', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
            {loading && !published ? '...' : 'Save draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={loading}
            style={{ padding: '0.45rem 1.1rem', background: '#c8f135', color: '#111', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>
            {loading && published ? '...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ─────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1rem 6rem' }}>

          {/* Form title — click to edit */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled form"
            style={{
              display: 'block', width: '100%',
              fontSize: '2rem', fontWeight: 800, color: title ? '#111' : '#d1d5db',
              border: 'none', outline: 'none', background: 'transparent',
              marginBottom: '0.5rem', letterSpacing: '-0.5px',
              boxSizing: 'border-box',
            }}
          />

          {/* Form description */}
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Form description (optional)"
            style={{
              display: 'block', width: '100%',
              fontSize: '1rem', color: description ? '#555' : '#9ca3af',
              border: 'none', outline: 'none', background: 'transparent',
              marginBottom: '2rem', boxSizing: 'border-box',
            }}
          />

          {/* Fields list */}
          {fields.map((field, idx) => (
            <div
              key={field.id}
              onClick={() => setActiveField(field.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '0.875rem 1rem',
                background: activeField === field.id ? '#f0fdf4' : '#fff',
                border: `1px solid ${activeField === field.id ? '#bbf7d0' : '#e5e7eb'}`,
                borderRadius: '10px', marginBottom: '8px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeField !== field.id) e.currentTarget.style.borderColor = '#d1d5db'; }}
              onMouseLeave={e => { if (activeField !== field.id) e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              {/* Type icon badge */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '7px',
                background: activeField === field.id ? '#dcfce7' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', flexShrink: 0, fontWeight: 700,
                color: activeField === field.id ? '#15803d' : '#6b7280',
              }}>
                {TYPE_ICON[field.type] || '—'}
              </div>

              {/* Field content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {activeField === field.id ? (
                  /* Expanded edit mode */
                  <div onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => updateField(field.id, 'label', e.target.value)}
                      placeholder="Field label..."
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        fontSize: '0.95rem', fontWeight: 700, color: '#111',
                        background: 'transparent', marginBottom: '0.5rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                      placeholder="Placeholder text (optional)..."
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        fontSize: '0.82rem', color: '#9ca3af', background: 'transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Type selector */}
                      <select
                        value={field.type}
                        onChange={e => updateField(field.id, 'type', e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem', border: '1px solid #e5e7eb',
                          borderRadius: '6px', fontSize: '0.78rem', color: '#555',
                          background: '#f9fafb', cursor: 'pointer',
                        }}
                      >
                        {QUICK_ADD.map(q => <option key={q.type} value={q.type}>{q.label}</option>)}
                      </select>
                      {/* Required toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#555', cursor: 'pointer' }}>
                        <div
                          onClick={() => updateField(field.id, 'required', !field.required)}
                          style={{
                            width: '36px', height: '20px', borderRadius: '100px',
                            background: field.required ? '#c8f135' : '#e5e7eb',
                            position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                          }}>
                          <div style={{
                            position: 'absolute', top: '2px',
                            left: field.required ? '18px' : '2px',
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: '#fff', transition: 'left 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          }}/>
                        </div>
                        Required
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Collapsed preview */
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>
                      {field.label}
                      {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>
                      {QUICK_ADD.find(q => q.type === field.type)?.label || field.type}
                      {field.placeholder && ` · "${field.placeholder}"`}
                    </div>
                  </div>
                )}
              </div>

              {/* Field actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}
                onClick={e => e.stopPropagation()}>
                <button onClick={() => moveField(field.id, -1)} disabled={idx === 0}
                  style={{ padding: '3px 6px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '5px', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#d1d5db' : '#666', fontSize: '0.7rem' }}>
                  ↑
                </button>
                <button onClick={() => moveField(field.id, 1)} disabled={idx === fields.length - 1}
                  style={{ padding: '3px 6px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '5px', cursor: idx === fields.length - 1 ? 'default' : 'pointer', color: idx === fields.length - 1 ? '#d1d5db' : '#666', fontSize: '0.7rem' }}>
                  ↓
                </button>
                <button onClick={() => removeField(field.id)}
                  style={{ padding: '3px 6px', background: 'none', border: '1px solid #fecaca', borderRadius: '5px', cursor: 'pointer', color: '#ef4444', fontSize: '0.7rem' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* ── ADD ROW PLACEHOLDER ─────────── */}
          <div
            ref={addRowRef}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0.875rem 1rem',
              border: '1.5px dashed #e5e7eb', borderRadius: '10px',
              cursor: 'text', marginBottom: '1.25rem',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c8f135'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            onClick={() => addField('text')}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#f3f4f6', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: '1rem', fontWeight: 700, flexShrink: 0,
            }}>+</div>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Type / to add a new row...
            </span>
          </div>

          {/* ── QUICK ADD BUTTONS ──────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {QUICK_ADD.map(q => (
              <button
                key={q.type}
                type="button"
                onClick={() => addField(q.type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '0.4rem 0.875rem',
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: '100px', cursor: 'pointer',
                  fontSize: '0.82rem', color: '#555', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8f135'; e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
              >
                <span style={{ fontSize: '0.75rem' }}>+</span>
                {q.label}
              </button>
            ))}
          </div>

          {/* Field count hint */}
          {fields.length > 0 && (
            <p style={{ marginTop: '2rem', fontSize: '0.78rem', color: '#9ca3af' }}>
              {fields.length} field{fields.length > 1 ? 's' : ''} added · Click a field to edit it
            </p>
          )}
        </div>
      </div>

      {/* ── BOTTOM TOOLBAR ──────────────────── */}
      <div style={{
        position: 'sticky', bottom: 0,
        borderTop: '1px solid #e5e7eb', background: '#fff',
        padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
          {fields.length === 0
            ? 'Add fields to your form using the buttons above'
            : `${fields.length} field${fields.length > 1 ? 's' : ''} · ${fields.filter(f => f.required).length} required`}
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={() => handleSave(false)} disabled={loading}
            style={{ padding: '0.55rem 1.1rem', background: '#f3f4f6', color: '#333', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
            Save draft
          </button>
          <button onClick={() => handleSave(true)} disabled={loading}
            style={{ padding: '0.55rem 1.25rem', background: '#c8f135', color: '#111', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>
            {loading ? '...' : 'Publish →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
