import axios from 'axios';

// Determine API base URL:
// - Uses VITE_API_URL for deployed backend in production (e.g., Render)
// - Uses http://localhost:5000 as the local development fallback
// - Avoids duplicate /api prefixes and provides helpful production diagnostics
const resolveApiBaseUrl = () => {
  const isProductionBrowser =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  let envUrl = (
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL ||
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : '') ||
    ''
  ).trim();

  // If in production browser (e.g. Vercel), ensure we NEVER attempt to connect to localhost:5000
  if (isProductionBrowser) {
    if (
      !envUrl ||
      envUrl.includes('localhost') ||
      envUrl.includes('127.0.0.1') ||
      envUrl.includes('your-backend-deployment-url') ||
      envUrl.includes('your-backend.onrender.com') ||
      envUrl.includes('<') ||
      envUrl === 'placeholder'
    ) {
      envUrl = 'https://ticketformovie.onrender.com';
    }
  }

  const baseUrl = envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:5000';

  if (baseUrl.endsWith('/api/v1')) {
    return baseUrl;
  }
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}/v1`;
  }
  return `${baseUrl}/api/v1`;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 60-second timeout allows free-tier hosting platforms (such as Render) to complete cold starts
  timeout: 60000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'An unexpected error occurred.';

    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (error.code === 'ERR_NETWORK' || message === 'Network Error') {
      message = isLocal
        ? 'Cannot connect to backend server. Please verify the API is running at http://localhost:5000.'
        : 'Cannot connect to backend server. If your backend is hosted on a free cloud service (such as Render), it may take 30-50 seconds to wake up from sleep. Please wait a moment and try again, or verify VITE_API_URL in Vercel settings.';
    } else if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      message = 'Backend server request timed out. If the backend is waking up from idle, please try again in a few seconds.';
    }

    // If 401 and token exists, clear expired token
    if (error.response?.status === 401 && localStorage.getItem('cineverse_token')) {
      // Don't auto logout on public page calls
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/my-bookings')) {
        localStorage.removeItem('cineverse_token');
        localStorage.removeItem('cineverse_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      response: error.response,
    });
  }
);

export default api;