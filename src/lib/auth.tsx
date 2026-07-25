"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, tokens } from "./api";

export interface User {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.access) {
      setLoading(false);
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    tokens.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  async function signup(email: string, password: string, fullName: string) {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify({ email, password, fullName }) },
    );
    tokens.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  function logout() {
    const refreshToken = tokens.refresh;
    if (refreshToken) {
      api("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        retry: false,
      }).catch(() => {});
    }
    tokens.clear();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
