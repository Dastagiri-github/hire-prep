"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface EmployeeAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function EmployeeAuthGuard({ children, requireAuth = true, redirectTo = "/employee-login" }: EmployeeAuthGuardProps) {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = auth.employeeToken;
        if (!token && requireAuth) {
          router.push(redirectTo);
          return;
        }

        if (token) {
          // Verify token by calling employee/me endpoint. If this fails the
          // interceptor will eventually clear the token and redirect as well.
          await employeeApi.get("/employee/auth/me");
          setIsAuthenticated(true);
        } else if (!requireAuth) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem("employee_access_token");
        auth.logout("employee");
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
  }, [requireAuth, redirectTo, router, auth.employeeToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && requireAuth) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
