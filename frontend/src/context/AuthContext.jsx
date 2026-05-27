/**
 * context/AuthContext.jsx
 * Provides auth state (user, token) and helpers (login, logout) to the whole app.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);  // true until initial /me call resolves

  // On first load, if we have a stored token, fetch the current user
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        // Token invalid/expired — clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []); // run once on mount

  /** Called after a successful login or register */
  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setUser(userData);
  };

  /** Log out and clear everything */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Custom hook — use this instead of useContext(AuthContext) directly */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
