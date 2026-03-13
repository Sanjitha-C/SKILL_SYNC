import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://skill-sync-backend-87m4.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('om_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;