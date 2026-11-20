import axios from 'axios';

// Base URL of the Express backend. Override with VITE_API_URL in .env (see .env.example).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const TOKEN_KEY = 'dow_token';
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage blocked */ }
};
export const clearToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ }
};

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

// ---- tiny "requests in flight" counter so the UI can show a loading bar
let pending = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(pending));
export const onPending = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.metaAuth = Boolean(token);
  pending += 1;
  emit();
  return config;
});

api.interceptors.response.use(
  (res) => { pending = Math.max(0, pending - 1); emit(); return res; },
  (err) => {
    pending = Math.max(0, pending - 1);
    emit();
    // An expired or revoked token on an authenticated call: drop the session everywhere.
    if (err.response?.status === 401 && err.config?.metaAuth) {
      clearToken();
      window.dispatchEvent(new Event('dow:unauthorized'));
    }
    return Promise.reject(err);
  },
);

// Turns any axios error into a message that is safe to show to a customer.
export function errorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (err.request && !err.response) return 'Cannot reach the server. Check that the backend is running and try again.';
  return err.message || 'Something went wrong.';
}

// Wraps a request so callers always get { ok, data } or { ok:false, error } and never need try/catch.
export async function safe(promise) {
  try {
    const res = await promise;
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: errorMessage(err), status: err.response?.status, details: err.response?.data?.details };
  }
}

export default api;
