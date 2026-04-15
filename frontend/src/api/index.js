import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('limitly_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (skip for auth verification & login/register calls)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-logout for auth verification, login, or register calls
      // These have their own error handling
      const skipLogoutPaths = ['/auth/me', '/auth/login', '/auth/register'];
      const shouldSkip = skipLogoutPaths.some(path => url.includes(path));
      
      if (!shouldSkip) {
        localStorage.removeItem('limitly_token');
        localStorage.removeItem('limitly_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  verifyResetToken: (params) => API.get('/auth/verify-reset-token', { params }),
};

// ─── Links ────────────────────────────────────────────────────────────────────
export const linksAPI = {
  create: (data) => API.post('/links/create', data),
  getAll: (params) => API.get('/links', { params }),
  edit: (id, data) => API.put(`/links/${id}`, data),
  delete: (id) => API.delete(`/links/${id}`),
  toggle: (id) => API.put(`/links/${id}/toggle`),
  checkSlug: (slug) => API.get('/links/check-slug', { params: { slug } }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview: () => API.get('/analytics/overview'),
  linkDetail: (id) => API.get(`/analytics/link/${id}`),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: () => API.post('/payment/create-order'),
  verify: (data) => API.post('/payment/verify', data),
  status: () => API.get('/payment/status'),
};

// ─── QR Code ──────────────────────────────────────────────────────────────────
export const qrAPI = {
  create: (data) => API.post('/qr/create', data),
  getAll: () => API.get('/qr'),
  update: (id, data) => API.put(`/qr/${id}`, data),
  analytics: (id) => API.get(`/qr/${id}/analytics`),
  delete: (id) => API.delete(`/qr/${id}`),
};

// ─── vCard ────────────────────────────────────────────────────────────────────
export const vcardAPI = {
  create: (data) => API.post('/vcard/create', data),
  getAll: () => API.get('/vcard'),
  delete: (id) => API.delete(`/vcard/${id}`),
};

// ─── Form ─────────────────────────────────────────────────────────────────────
export const formAPI = {
  create: (data) => API.post('/form/create', data),
  getAll: () => API.get('/form'),
  getResponses: (id) => API.get(`/form/${id}/responses`),
  update: (id, data) => API.put(`/form/${id}`, data),
  delete: (id) => API.delete(`/form/${id}`),
};

// ─── Alt Generator ────────────────────────────────────────────────────────────
export const altAPI = {
  generate: (data) => API.post('/alt/generate', data),
};

export default API;
