import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://skill-sync-backend-87m4.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('om_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const AUTH_REQUEST_TIMEOUT_MS = 30000;

export const getApiErrorMessage = (error, fallback) => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The server took too long to respond. Please try again.';
  }
  if (!error.response) {
    return 'Cannot reach the server. Check that the backend is running and try again.';
  }
  return error.response.data?.message || fallback;
};