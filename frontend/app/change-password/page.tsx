"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ChangePassword() {
    const [tempPassword, setTempPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showTemp, setShowTemp] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/change-password", {
                temp_password: tempPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
                "Failed to change password. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
                <div className="glass-panel w-full max-w-sm p-8 rounded-2xl border border-white/10 text-center animate-fade-in">
                    <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Password Updated!</h2>
                    <p className="text-sm text-gray-400">Redirecting to your dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
            <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="text-center mb-5 relative z-10">
                    <div className="w-11 h-11 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                        <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Set Your Password
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Use the temporary password from your email to set a new one.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {error && (
                        <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    {/* Temp Password */}
                    <div>
                        <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                            Temporary Password
                        </label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={showTemp ? "text" : "password"}
                                placeholder="From your email"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                className="w-full pl-9 pr-10 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-500/40 outline-none text-sm text-white placeholder-gray-600"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowTemp((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                {showTemp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                            New Password
                        </label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="Minimum 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-9 pr-10 py-2.5 bg-black/30 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-500/40 outline-none text-sm text-white placeholder-gray-600"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-[11px] font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                            Confirm Password
                        </label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repeat your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-9 pr-10 py-2.5 bg-black/30 border rounded-md focus:ring-2 outline-none text-sm text-white placeholder-gray-600 transition-colors ${confirmPassword && confirmPassword !== newPassword
                                        ? "border-red-500/40 focus:ring-red-500/30"
                                        : "border-white/10 focus:ring-blue-500/40"
                                    }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-[11px] text-red-400 mt-1 ml-1">Passwords don&apos;t match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!!confirmPassword && confirmPassword !== newPassword)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-md font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Set Password
                                <Shield className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-xs text-gray-400 relative z-10">
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
