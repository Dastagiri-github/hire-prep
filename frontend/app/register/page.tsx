"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Mail, Lock } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { username, email, password });
      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
      <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">

        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

        {/* Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="w-11 h-11 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
            <UserPlus className="w-5 h-5 text-purple-400" />
          </div>

          <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-purple-100 to-gray-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-xs text-gray-400">
            Join the developer community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
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
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white placeholder-gray-600"
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
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white placeholder-gray-600"
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
                Create Account
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
