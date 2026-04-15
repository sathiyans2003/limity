import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../api';
import toast from 'react-hot-toast';

const Upgrade = () => {
  const { user, updateUserPlan } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.createOrder();
      const { order, key, user: u, amount } = res.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Limitly Pro',
        description: 'Monthly SaaS Subscription',
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentAPI.verify(response);
            toast.success('🎉 Welcome to Pro! Your account is now upgraded.');
            updateUserPlan('pro');
            navigate('/account/dashboard');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: u.name, email: u.email },
        theme: { color: '#c8f135' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment failed to initialize. Check Razorpay config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#080808', minHeight: '100vh', color: 'white',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Top Bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '60px',
        background: '#080808', borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/account/dashboard')}
            style={{
              background: '#111111', border: '1px solid #222222',
              borderRadius: '8px', padding: '0.4rem 0.85rem',
              color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            ← Back
          </button>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c8f135' }}>
            🔗 Limitly
          </span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Logged in as {user?.name}
        </span>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#e2e8f0' }}>
            Power up your workflow
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Choose the plan that fits your growth.
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

          {/* Free Plan */}
          <div style={cardStyle}>
            <div style={badgeStyle('rgba(148,163,184,0.1)', '#94a3b8')}>BASIC</div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, margin: '1.25rem 0', color: '#e2e8f0' }}>
              ₹0 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/mo</span>
            </div>
            <ul style={listStyle}>
              <li>✅ 5 Short Links (Maximum)</li>
              <li>✅ Basic Lead Forms</li>
              <li>✅ Static QR Codes</li>
              <li style={{ color: '#475569' }}>❌ Advanced Analytics</li>
            </ul>
            <button disabled style={{
              ...btnStyle,
              background: '#1e293b', cursor: 'default', color: '#64748b',
            }}>
              {user?.plan === 'free' ? 'Current Plan' : 'Free Version'}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            ...cardStyle,
            border: '2px solid #c8f135',
            transform: 'scale(1.03)',
            boxShadow: '0 0 40px rgba(200,241,53,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={badgeStyle('rgba(200,241,53,0.1)', '#c8f135')}>PRO SUITE</div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 900, color: '#111',
                background: '#c8f135', padding: '3px 8px', borderRadius: '100px',
              }}>POPULAR</span>
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, margin: '1.25rem 0', color: '#e2e8f0' }}>
              ₹1 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/mo</span>
            </div>
            <ul style={listStyle}>
              <li>🔥 Unlimited Short Links</li>
              <li>🔥 Advanced Lead Tracking</li>
              <li>🔥 Professional vCards</li>
              <li>🔥 Dynamic QR Codes</li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading || user?.plan === 'pro'}
              style={{
                ...btnStyle,
                background: user?.plan === 'pro' ? '#1e293b' : '#c8f135',
                color: user?.plan === 'pro' ? '#64748b' : '#111',
                cursor: user?.plan === 'pro' ? 'default' : 'pointer',
              }}
            >
              {loading ? '⏳ Processing...' : user?.plan === 'pro' ? '✅ Active Subscription' : '⚡ Upgrade to Pro →'}
            </button>
          </div>

        </div>

        {/* Security note */}
        <div style={{
          marginTop: '3rem', padding: '1.5rem 2rem',
          background: '#111111', borderRadius: '14px',
          border: '1px solid #222222', textAlign: 'center',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            🔒 Secure payments via <strong style={{ color: '#94a3b8' }}>Razorpay</strong>. Your data is encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: '#111111', border: '1px solid #222222', borderRadius: '20px',
  padding: '2.5rem', textAlign: 'left', position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const badgeStyle = (bg, color) => ({
  background: bg, color: color, padding: '4px 12px', borderRadius: '100px',
  fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px', display: 'inline-block',
});

const listStyle = {
  listStyle: 'none', padding: 0, margin: '2rem 0',
  display: 'flex', flexDirection: 'column', gap: '1rem',
  fontSize: '0.88rem', color: '#e2e8f0',
};

const btnStyle = {
  width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
  fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: '0.2s',
};

export default Upgrade;
