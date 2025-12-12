import { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;

  isAdmin: boolean;
  isSeller: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Ensure token + user stored
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [token, user]);

  const login = (jwtToken: string, u: any) => {
    // FIX: backend returns { role: "ADMIN" } sometimes
    if (!u.roles && u.role) {
      u.roles = [u.role];
    }

    setToken(jwtToken);
    setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const isSeller = user?.roles?.includes("SELLER") ?? false;
  const isCustomer = user?.roles?.includes("CUSTOMER") ?? false;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAdmin, isSeller, isCustomer }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
