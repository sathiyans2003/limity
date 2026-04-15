import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      
      {/* ─── HERO SECTION ───────────────────────── */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>How can we help?</h1>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search for articles (Ctrl + K)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem 1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', 
              borderRadius: '12px', color: 'var(--text)', fontSize: '1rem', outline: 'none', boxShadow: 'var(--shadow)'
            }}
          />
        </div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
          Welcome to the Limitly help center! We're here to help you build and manage your online presence with ease.
        </p>
      </section>

      {/* ─── MAIN CONTENT ────────────────────────── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          {/* Get Started Section */}
          <section>
            <h2 style={sectionTitleStyle}>🚀 Get Started</h2>
            <p style={sectionDescStyle}>New to Limitly? Start with our Master the Basics guides.</p>
            <ul style={listStyle}>
              <HelpLink label="How to Claim Your Product" />
              <HelpLink label="Shorten a Link in 3 Seconds" />
              <HelpLink label="Generate a Custom QR Code" />
              <HelpLink label="Create Your First Micro-Site" />
            </ul>
          </section>

          {/* Guides Section */}
          <section>
            <h2 style={sectionTitleStyle}>📚 Advanced Domain Guides</h2>
            <p style={sectionDescStyle}>Dive into comprehensive tutorials for stunning one-page websites.</p>
            <ul style={listStyle}>
              <HelpLink label="Link Your Card to a Site" />
              <HelpLink label="Claim Your Google Review Product" />
              <HelpLink label="Embed a Substack Signup Form" />
              <HelpLink label="Add Senja Testimonials" />
              <HelpLink label="Add a Custom Domain" />
            </ul>
          </section>

          {/* Site Blocks Section */}
          <section>
            <h2 style={sectionTitleStyle}>🧩 Site Blocks</h2>
            <p style={sectionDescStyle}>Learn how to use Limitly's building blocks effectively.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Tag label="Media Gallery" />
              <Tag label="Support Me" />
              <Tag label="Image with Text" />
              <Tag label="Icon Links" />
              <Tag label="Code Block" />
              <Tag label="Forms" />
            </div>
          </section>

        </div>

        {/* ─── FOOTER ─────────────────────────────── */}
        <footer style={{ marginTop: '8rem', paddingTop: '4rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontWeight: 900, color: 'var(--accent)', marginBottom: '1.5rem' }}>LIMITLY</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empowering your digital presence.</p>
          </div>
          <div>
            <h4 style={footerTitleStyle}>Product</h4>
            <div style={footerLinkStyle}>Site Builder</div>
            <div style={footerLinkStyle}>Link Management</div>
            <div style={footerLinkStyle}>QR Generator</div>
          </div>
          <div>
            <h4 style={footerTitleStyle}>Company</h4>
            <div style={footerLinkStyle}>About</div>
            <div style={footerLinkStyle}>Pricing</div>
            <div style={footerLinkStyle}>Blog</div>
          </div>
          <div>
            <h4 style={footerTitleStyle}>Free Tools</h4>
            <div style={footerLinkStyle}>Alt Text Generator</div>
            <div style={footerLinkStyle}>UTM Builder</div>
            <div style={footerLinkStyle}>IG Alt Text</div>
          </div>
        </footer>

        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
           © Limitly 2026 • Privacy • Terms • Feedback
        </div>
      </div>
    </div>
  );
};

const sectionTitleStyle = { fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text)' };
const sectionDescStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const footerTitleStyle = { fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.25rem' };
const footerLinkStyle = { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', cursor: 'pointer' };

const HelpLink = ({ label }) => (
  <li style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
    <span style={{ marginRight: '8px' }}>→</span> {label}
  </li>
);

const Tag = ({ label }) => (
  <span style={{ 
    padding: '6px 14px', borderRadius: '8px', background: 'var(--card)', border: '1px solid var(--border)', 
    fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 
  }}>
    {label}
  </span>
);

export default HelpCenter;
