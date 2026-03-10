import axios from 'axios';
import supabase from './supabase';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, '')}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Cache the session to avoid async lookups on every request
let cachedToken = null;

// Keep token in sync with Supabase session
supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token || null;
});

// Initialize token from existing session (non-blocking)
supabase.auth.getSession().then(({ data: { session } }) => {
  cachedToken = session?.access_token || null;
});

// Request interceptor — use cached token (synchronous, zero latency)
API.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
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
      cachedToken = null;
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
      supabase.auth.signOut();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
