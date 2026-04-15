import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Forms from './pages/Forms';
import NewForm from './pages/NewForm';
import FormResponses from './pages/FormResponses';
import ShortLinks from './pages/ShortLinks';
import Upgrade from './pages/Upgrade';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import LegalPage from './pages/LegalPage';

// Protected Route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem' }}>
      ⏳ Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/account/dashboard" /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    
    {/* Account Routes — Nested under Dashboard for consistent Sidebar */}
    <Route path="/account" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
        <Route index element={<Navigate to="/account/dashboard" />} />
        <Route path="dashboard" element={<Navigate to="/account/links" />} /> 
        <Route path="links" element={<ShortLinks />} />
        <Route path="qrcodes" element={<div>QR Code Feature coming soon</div>} />
        <Route path="vcards" element={<div>vCard Feature coming soon</div>} />
        <Route path="forms" element={<Forms />} />
        <Route path="forms/new" element={<NewForm />} />
        <Route path="forms/edit/:id" element={<NewForm />} />
        <Route path="forms/responses/:id" element={<FormResponses />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpCenter />} />
    </Route>
    
    <Route path="/upgrade" element={<PrivateRoute><Upgrade /></PrivateRoute>} />
    
    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/privacy" element={<LegalPage />} />
    <Route path="/terms" element={<LegalPage />} />
    <Route path="/cookies" element={<LegalPage />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' },
          success: { iconTheme: { primary: '#D9FF00', secondary: 'black' } },
        }}
      />
      <AppRoutes />
    </Router>
  );
}

export default App;
