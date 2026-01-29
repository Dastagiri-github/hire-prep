"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData);
      localStorage.setItem("token", response.data.access_token);
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password");
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
            <LogIn className="w-6 h-6 text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-1">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-400">
            Login to continue your journey
          </p>
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

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
