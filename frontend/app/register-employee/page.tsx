"use client";
import { useState } from "react";
import { employeeApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Mail, ShieldAlert, CheckCircle } from "lucide-react";

export default function RegisterEmployee() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
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
            await employeeApi.post("/employee/auth/register", { name, username, email });
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

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
                <div className="glass-panel w-full max-w-sm p-8 rounded-2xl shadow-xl border border-white/10 text-center animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl" />
                    <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle className="w-7 h-7 text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Employee Account Created!</h2>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        We sent a <strong className="text-gray-300">temporary password</strong> to{" "}
                        <span className="text-emerald-400">{email}</span>.<br />
                        Check your inbox and use it to access the portal.
                    </p>
                    <button
                        onClick={() => router.push("/employee-login")}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-md font-semibold text-sm transition-all"
                    >
                        Go to Employee Login →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
            <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500" />

                <div className="text-center mb-5 relative z-10">
                    <div className="w-11 h-11 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-teal-500/20">
                        <ShieldAlert className="w-5 h-5 text-teal-400" />
                    </div>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                        Employee Portal
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Authorized Personnel Registration
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
                                placeholder="Staff Member"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-teal-500/40 outline-none text-sm text-white placeholder-gray-600"
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
                                placeholder="staff_admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-teal-500/40 outline-none text-sm text-white placeholder-gray-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                            Work Email
                        </label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                placeholder="staff@hireprep.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-teal-500/40 outline-none text-sm text-white placeholder-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-md font-semibold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Register Account
                                <UserPlus className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
                    Already have access?{" "}
                    <Link
                        href="/employee-login"
                        className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
