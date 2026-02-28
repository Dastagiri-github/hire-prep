"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Mail, Calendar, CheckCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { name, username, dob, email });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/google", { credential: credentialResponse.credential });
      localStorage.setItem("access_token", response.data.access_token);
      if (response.data.reset_password === 1) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
        <div className="glass-panel w-full max-w-sm p-8 rounded-2xl shadow-xl border border-white/10 text-center animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-t-2xl" />
          <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Account Created!</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            We sent a <strong className="text-gray-300">temporary password</strong> to{" "}
            <span className="text-purple-400">{email}</span>.<br />
            Check your inbox and use it to sign in.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-md font-semibold text-sm transition-all"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
      <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

        <div className="text-center mb-5 relative z-10">
          <div className="w-11 h-11 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
            <UserPlus className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-xs text-gray-400">
            A temporary password will be sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
              Date of Birth
            </label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-purple-500/40 outline-none text-sm text-white [color-scheme:dark]"
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

        <div className="relative my-6 z-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0f1423] text-gray-500 px-2">OR</span>
          </div>
        </div>

        <div className="flex justify-center z-10 relative mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In failed")}
            theme="filled_black"
            shape="pill"
            text="signup_with"
          />
        </div>

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
