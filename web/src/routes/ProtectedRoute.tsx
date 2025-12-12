// FILE: src/routes/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Allowed roles are literal strings
export type Role = "CUSTOMER" | "SELLER" | "ADMIN";
type AllowedRoles = Role[];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRoles;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token } = useAuth();

  // 1. Logged out
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check role access
  if (allowedRoles) {
    // cast each user role to our Role union if valid
    const matchingRoles = user.roles.filter((r): r is Role =>
      ["CUSTOMER", "SELLER", "ADMIN"].includes(r)
    );

    const hasAccess = matchingRoles.some((r) =>
      allowedRoles.includes(r)
    );

    if (!hasAccess) {
      // Admins NEVER go to home
      if (matchingRoles.includes("ADMIN")) {
        return <Navigate to="/admin" replace />;
      }
      // Everyone else → customer dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
