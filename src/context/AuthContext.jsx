// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import api from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    if (!t) return null;
    try { return jwt_decode(t); } catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login/", { email, password }); // adapt endpoint if needed
    const access = res.data.access || res.data.token || res.data;
    // if backend returns full object, adjust above
    const tokenValue = typeof access === "string" ? access : access?.access || access?.token;
    if (!tokenValue) throw new Error("No token returned");
    setToken(tokenValue);
    try { setUser(jwt_decode(tokenValue)); } catch { setUser(null); }
    return res;
  };

  const logout = () => { setToken(null); setUser(null); localStorage.removeItem("token"); };

  const register = (payload) => api.post("/auth/register/", payload);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
