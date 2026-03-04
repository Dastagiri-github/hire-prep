"use client";
import { useState, useEffect } from "react";
import api, { employeeApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LogIn, User, Lock, Building2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"user" | "employee">("user");
  const router = useRouter();
  const auth = useAuth();

  // if a token already exists for the current userType, redirect immediately
  useEffect(() => {
    const key = userType === "employee" ? "employee" : "user";
    const existing = userType === "employee" ? auth.employeeToken : auth.userToken;
    if (existing) {
      router.push(userType === "employee" ? "/employee-dashboard" : "/dashboard");
    }
  }, [userType, auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const endpoint = userType === "employee" ? "/employee/auth/login" : "/auth/login";
      const apiInstance = userType === "employee" ? employeeApi : api;
      const tokenKey = userType === "employee" ? "employee_access_token" : "access_token";
      const redirectPath = userType === "employee" ? "/employee-dashboard" : "/dashboard";

      const response = await apiInstance.post(endpoint, formData);
      // overwrite any existing session for this type
      auth.login(response.data.access_token, userType === "employee" ? "employee" : "user");

      if (response.data.reset_password === 1 && userType === "user") {
        router.push("/change-password");
      } else {
        router.push(redirectPath);
      }
    } catch {
      setError(`Invalid username or password for ${userType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      const endpoint = userType === "employee" ? "/employee/auth/google" : "/auth/google";
      const apiInstance = userType === "employee" ? employeeApi : api;
      const tokenKey = userType === "employee" ? "employee_access_token" : "access_token";
      const redirectPath = userType === "employee" ? "/employee-dashboard" : "/dashboard";

      const response = await apiInstance.post(endpoint, { credential: credentialResponse.credential });
      auth.login(response.data.access_token, userType === "employee" ? "employee" : "user");

      if (response.data.reset_password === 1 && userType === "user") {
        router.push("/change-password");
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
      <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">

        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            {userType === "employee" ? (
              <Building2 className="w-6 h-6 text-purple-400" />
            ) : (
              <LogIn className="w-6 h-6 text-blue-400" />
            )}
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-1">
            {userType === "employee" ? "Employee Portal" : "Welcome Back"}
          </h1>
          <p className="text-xs text-gray-400">
            {userType === "employee" ? "Login to access employee dashboard" : "Login to continue your journey"}
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex bg-black/30 border border-white/10 rounded-lg p-1 mb-6 relative z-10">
          <button
            onClick={() => setUserType("user")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === "user"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            User
          </button>
          <button
            onClick={() => setUserType("employee")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === "employee"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Employee
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/40 outline-none text-sm text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/40 outline-none text-sm text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-md font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <div className="relative my-6 z-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0f1423] text-gray-500 px-2">OR</span>
          </div>
        </div>

        {/* Google OAuth - Only show if configured */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
          <div className="flex justify-center z-10 relative mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In failed")}
              theme="filled_black"
              shape="pill"
            />
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 mb-4">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-gray-400 mb-1">🔐 Google Sign-In</p>
              <p className="text-gray-500 text-xs">Configure Google OAuth to enable</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
          {userType === "user" ? (
            <>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
              >
                Create one
              </Link>
            </>
          ) : (
            <>
              Employee access is restricted.{" "}
              <span className="text-purple-400 font-semibold">
                Contact administrator
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
