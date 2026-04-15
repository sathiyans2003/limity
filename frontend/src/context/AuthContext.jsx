import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('limitly_token');
    const savedUser = localStorage.getItem('limitly_user');
    if (token && savedUser) {
      const cachedUser = JSON.parse(savedUser);
      setUser(cachedUser);
      // Verify token is still valid
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
          // Update cached user data
          localStorage.setItem('limitly_user', JSON.stringify(res.data.user));
        })
        .catch((err) => {
          // Only logout if token is truly invalid/expired (401)
          // For network errors or server issues, keep the cached session
          if (err.response?.status === 401) {
            localStorage.removeItem('limitly_token');
            localStorage.removeItem('limitly_user');
            setUser(null);
          }
          // Otherwise keep the cached user — don't auto-logout
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('limitly_token', res.data.token);
    localStorage.setItem('limitly_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('limitly_token', res.data.token);
    localStorage.setItem('limitly_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('limitly_token');
    localStorage.removeItem('limitly_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserPlan = (plan) => {
    const updated = { ...user, plan };
    setUser(updated);
    localStorage.setItem('limitly_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
