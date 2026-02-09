"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
          setToken(storedToken);

          // Verify token and get fresh user data
          const res = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            // The backend returns { status: 'success', data: user }
            const userData = data.data || data;

            if (userData.role !== "ADMIN" && userData.role !== "CHEF") {
              throw new Error("Insufficient privileges");
            }

            setUser(userData);
            // Update local storage with fresh data just in case, but we don't rely on it for role
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            throw new Error("Token validation failed");
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.data.user.role !== "ADMIN" && data.data.user.role !== "CHEF") {
      throw new Error("Access denied. Insufficient privileges.");
    }

    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    setToken(data.data.token);
    setUser(data.data.user);

    return data.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated =
    !!token && (user?.role === "ADMIN" || user?.role === "CHEF");

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
