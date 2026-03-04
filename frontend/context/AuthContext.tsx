"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { employeeApi } from "@/lib/api";

// support two distinct sessions: regular user and employee user
export type SessionType = "user" | "employee";

const TOKEN_KEYS: Record<SessionType, string> = {
  user: "access_token",
  employee: "employee_access_token",
};

interface AuthContextType {
  /**
   * token currently in memory (mirrors localStorage). null if not logged in.
   * For simplicity we expose both at once; callers can ignore the one they
   * don't care about.
   */
  userToken: string | null;
  employeeToken: string | null;

  /**
   * Save a new token for the given session type. This updates localStorage,
   * notifies other tabs and updates context state.
   */
  login: (token: string, type?: SessionType) => void;

  /**
   * Log out. If "type" is omitted or "all" then both sessions are cleared.
   * The server logout endpoint(s) are also called with credentials included.
   */
  logout: (type?: SessionType | "all") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [employeeToken, setEmployeeToken] = useState<string | null>(null);

  // On mount read whatever is already in localStorage.
  useEffect(() => {
    setUserToken(localStorage.getItem(TOKEN_KEYS.user));
    setEmployeeToken(localStorage.getItem(TOKEN_KEYS.employee));
  }, []);

  // Listen for cross-tab storage events. When the key we care about changes
  // the browser will fire "storage" in all other windows, allowing us to
  // keep React state in sync. We also use custom "logout_*" signals to
  // broadcast explicit logouts (so removal of the token does not get lost if
  // another tab overwrites with a new value).
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TOKEN_KEYS.user) {
        setUserToken(e.newValue);
      } else if (e.key === TOKEN_KEYS.employee) {
        setEmployeeToken(e.newValue);
      } else if (e.key === "logout_user") {
        setUserToken(null);
      } else if (e.key === "logout_employee") {
        setEmployeeToken(null);
      } else if (e.key === "logout_all") {
        setUserToken(null);
        setEmployeeToken(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const broadcast = (key: string) => {
    // write then remove so that other tabs get the event even if the
    // same key/value pair was used previously.
    localStorage.setItem(key, Date.now().toString());
    localStorage.removeItem(key);
  };

  const login = (token: string, type: SessionType = "user") => {
    const key = TOKEN_KEYS[type];
    localStorage.setItem(key, token);
    if (type === "user") setUserToken(token);
    else setEmployeeToken(token);
    // writing the token itself generates a storage event in other tabs, no
    // need for a separate "login" signal.
  };

  const logout = async (type: SessionType | "all" = "user") => {
    // call server endpoints first; we swallow errors because we still want to
    // clear client state even if the network failed.
    try {
      if (type === "user" || type === "all") {
        await api.post("/auth/logout", {}, { withCredentials: true });
      }
      if (type === "employee" || type === "all") {
        await employeeApi.post("/employee/auth/logout", {}, { withCredentials: true });
      }
    } catch (err) {
      console.warn("logout request failed", err);
    }

    if (type === "user" || type === "all") {
      localStorage.removeItem(TOKEN_KEYS.user);
      setUserToken(null);
      broadcast("logout_user");
    }
    if (type === "employee" || type === "all") {
      localStorage.removeItem(TOKEN_KEYS.employee);
      setEmployeeToken(null);
      broadcast("logout_employee");
    }
    if (type === "all") {
      broadcast("logout_all");
    }
  };

  // NOTE: explicit redirects on token removal were causing loops when the
  // user visited the other login page (e.g. userToken null would send
  // /employee-login -> /login -> /employee-login repeatedly).  The AuthGuard
  // components already handle protecting pages and will redirect to the
  // correct login route, so we can drop these effects entirely.  If other
  // parts of the app need to react to a cleared token they should use the
  // `storage` listener above or check `userToken`/`employeeToken` directly.

  const value: AuthContextType = {
    userToken,
    employeeToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
