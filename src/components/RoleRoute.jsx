// src/components/RoleRoute.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowed = [] }) {
  const { user } = useContext(AuthContext);
  const role = user?.role || user?.roles?.[0];
  if (!user) return <Navigate to="/login" replace />;
  if (allowed.length && !allowed.includes(role)) return <Navigate to="/unauthorized" replace />;
  return children;
}
