import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AltGeneratorModal({ onClose }) {
  const [image, setImage] = useState(null);       // { base64, mimeType, preview }
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef();

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      setImage({ base64, mimeType: file.type, preview: dataUrl });
      setAltText('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleGenerate = async () => {
    if (!image) { toast.error('Please upload an image first'); return; }
    setLoading(true);
    setAltText('');
    try {
      const token = localStorage.getItem('limitly_token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alt/generate`,
        { image_base64: image.base64, mime_type: image.mimeType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAltText(res.data.alt_text);
      toast.success('Alt text generated!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate alt text';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!altText) return;
    navigator.clipboard.writeText(altText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setImage(null);
    setAltText('');
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🖼️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>Alt Text Generator</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>AI-powered image accessibility text</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '22px',
            cursor: 'pointer', color: '#999', lineHeight: 1
          }}>×</button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />

        {/* Drop Zone */}
        <div
          onClick={() => !image && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${dragging ? '#6c63ff' : image ? '#6c63ff' : '#ddd'}`,
            borderRadius: '12px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: image ? 'default' : 'pointer',
            background: dragging ? '#f5f3ff' : image ? '#fafafa' : '#fafafa',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {image ? (
            <>
              <img
                src={image.preview}
                alt="Preview"
                style={{
                  maxWidth: '100%', maxHeight: '220px',
                  borderRadius: '8px', objectFit: 'contain'
                }}
              />
              {/* Replace button */}
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{
                  position: 'absolute', bottom: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  border: 'none', borderRadius: '8px', padding: '6px 12px',
                  fontSize: '12px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '4px'
                }}
              >
                ↑ Replace
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
              <p style={{ margin: 0, fontWeight: 600, color: '#444' }}>Click or drop image here</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#999' }}>
                JPG, PNG, GIF, WEBP · Max 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!image || loading}
          style={{
            width: '100%', padding: '14px', marginTop: '16px',
            background: !image || loading ? '#ccc' : 'linear-gradient(135deg, #6c63ff, #8b83ff)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 700, cursor: !image || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                borderTop: '2px solid #fff', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', display: 'inline-block'
              }} />
              Generating...
            </>
          ) : (
            <>✨ Generate Alt Text</>
          )}
        </button>

        {/* Result */}
        {altText && (
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            border: '1px solid #d8b4fe',
            borderRadius: '12px', padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '5px' }}>
                📋 Generated Alt Text
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '5px 12px', fontSize: '12px', fontWeight: 600,
                    background: copied ? '#22c55e' : '#6c63ff',
                    color: '#fff', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '5px 12px', fontSize: '12px', fontWeight: 600,
                    background: '#fff', color: '#666',
                    border: '1px solid #e0e0e0', borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <p style={{
              margin: 0, fontSize: '15px', color: '#4c1d95',
              fontWeight: 500, lineHeight: 1.5,
              background: '#fff', borderRadius: '8px',
              padding: '12px', border: '1px solid #e9d5ff'
            }}>
              {altText}
            </p>

            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#8b5cf6' }}>
              💡 Tip: Use this as the <code style={{ background: '#ede9fe', padding: '1px 5px', borderRadius: '4px' }}>alt=""</code> attribute in your HTML image tag.
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
