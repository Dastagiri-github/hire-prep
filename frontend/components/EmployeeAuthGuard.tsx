"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeApi } from "@/lib/api";

interface EmployeeAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function EmployeeAuthGuard({ children, requireAuth = true, redirectTo = "/employee-login" }: EmployeeAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("employee_access_token");
        if (!token && requireAuth) {
          router.push(redirectTo);
          return;
        }

        if (token) {
          // Verify token by calling employee/me endpoint
          await employeeApi.get("/employee/auth/me");
          setIsAuthenticated(true);
        } else if (!requireAuth) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token is invalid, clear it and redirect
        localStorage.removeItem("employee_access_token");
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
