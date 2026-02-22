"use client";
import { useState } from "react";
import { employeeApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock, ShieldAlert } from "lucide-react";

export default function EmployeeLogin() {
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

            const response = await employeeApi.post("/employee/auth/login", formData);
            // Store entirely separately to avoid overlap with standard users
            localStorage.setItem("employee_access_token", response.data.access_token);

            // Navigate to the secure employee dashboard
            router.push("/employee-dashboard");
        } catch {
            setError("Invalid employee credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
            <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">

                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500" />

                {/* Header */}
                <div className="text-center mb-6 relative z-10">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-teal-500/20">
                        <ShieldAlert className="w-6 h-6 text-teal-400" />
                    </div>

                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500 bg-clip-text text-transparent mb-1">
                        Employee Portal
                    </h1>
                    <p className="text-xs text-gray-400">
                        Authorized Access Only
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
                            Staff ID / Username
                        </label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500/40 outline-none text-sm text-white placeholder-gray-600"
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
                                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500/40 outline-none text-sm text-white placeholder-gray-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-md font-semibold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Secure Checkout
                                <LogIn className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>

                </form>

                {/* Footer */}
                <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
                    Need access?{" "}
                    <Link
                        href="/register-employee"
                        className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors"
                    >
                        Request Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
