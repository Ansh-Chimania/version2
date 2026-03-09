import axios from 'axios';

const API = axios.create({
  baseURL: 'https://version2-jri3.onrender.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
