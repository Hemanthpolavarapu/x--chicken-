"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthUser } from "@x-chicken/shared";
import { apiRequest } from "@/lib/apiClient";

interface AuthContextType {
  customer: AuthUser | null;
  isLoading: boolean;
  setCustomer: (user: AuthUser | null) => void;
  refreshCustomer: () => Promise<void>;
  logoutCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomer = useCallback(async () => {
    try {
      const data = await apiRequest<{ user: AuthUser }>("/api/v1/auth/me");
      setCustomer(data.user);
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<{ user: AuthUser }>("/api/v1/auth/me")
      .then((data) => {
        if (active) setCustomer(data.user);
      })
      .catch(() => {
        if (active) setCustomer(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const logoutCustomer = useCallback(async () => {
    try {
      await apiRequest<{ loggedOut: boolean }>("/api/v1/auth/logout", {
        method: "POST",
      });
    } finally {
      setCustomer(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        setCustomer,
        refreshCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
