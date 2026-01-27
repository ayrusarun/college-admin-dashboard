"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/client";
import { User, Token } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      const tokenData: Token = response.data;

      // Save token
      localStorage.setItem("access_token", tokenData.access_token);

      // Get user info
      const userResponse = await authApi.getCurrentUser();
      const userData = userResponse.data;

      // Check if user is admin, staff, or super_admin
      if (userData.role !== "admin" && userData.role !== "staff" && userData.role !== "super_admin") {
        localStorage.removeItem("access_token");
        throw new Error("Access denied. Only administrators and staff can access this dashboard.");
      }

      setUser(userData);

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(
        error.response?.data?.detail || error.message || "Login failed. Please check your credentials."
      );
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
