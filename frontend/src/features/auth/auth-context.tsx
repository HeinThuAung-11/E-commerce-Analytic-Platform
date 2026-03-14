import { createContext, useContext, useEffect, useState } from "react";

import { env } from "../../config/env";
import { apiClient } from "../../services/http";
import { setUnauthorizedHandler } from "../../services/http";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token-store";
import { logout as logoutRequest } from "./auth.service";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "ANALYST";
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticatedSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  enableDemoSession: () => void;
  logout: () => Promise<void>;
};

type AuthEnvelope = {
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: JSX.Element;
};

const demoUser: AuthUser = {
  id: "demo-user",
  name: "Demo Analyst",
  email: "demo@ecommerce-analytics.com",
  role: "ANALYST",
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function clearSession(): void {
    clearAccessToken();
    setUser(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    async function restoreSession(): Promise<void> {
      if (env.demoMode) {
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.post<AuthEnvelope>("/auth/refresh", {});
        const nextToken = response.data.data.accessToken;
        const nextUser = response.data.data.user;

        setAccessToken(nextToken);
        setUser(nextUser);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  function setAuthenticatedSession(nextUser: AuthUser, accessToken: string): void {
    setAccessToken(accessToken);
    setUser(nextUser);
  }

  function enableDemoSession(): void {
    setUser(demoUser);
  }

  async function logout(): Promise<void> {
    if (env.demoMode) {
      clearSession();
      return;
    }

    await logoutRequest();
    clearSession();
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    setAuthenticatedSession,
    clearSession,
    enableDemoSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
