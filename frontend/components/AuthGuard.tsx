"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ children, requireAuth = true, redirectTo = "/login" }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token && requireAuth) {
          router.push(redirectTo);
          return;
        }

        if (token) {
          // Verify token by calling /auth/me
          await api.get("/auth/me");
          setIsAuthenticated(true);
        } else if (!requireAuth) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token is invalid, clear it and redirect
        localStorage.removeItem("access_token");
        if (requireAuth) {
          router.push(redirectTo);
        } else {
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router]);

  // Render children immediately to allow pages to show their own custom skeletons
  // The AuthGuard will invisibly redirect in the background if auth fails.
  if (isLoading) {
    return <>{children}</>;
  }

  if (!isAuthenticated && requireAuth) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
