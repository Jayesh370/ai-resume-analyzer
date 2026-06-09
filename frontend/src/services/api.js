/**
 * services/api.js — Axios instance
 * Automatically attaches the JWT token to every request.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,          // Vite dev proxy → http://localhost:5000/api
  timeout: 30000,           // 30 s (AI calls can be slow)
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — inject Bearer token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — normalise error messages ───────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      "Something went wrong";

    // Attach a clean message to the error object for components to display
    err.displayMessage = message;
    return Promise.reject(err);
  }
);

export default api;
