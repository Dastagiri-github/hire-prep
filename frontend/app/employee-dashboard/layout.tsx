"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ShieldAlert,
    LayoutDashboard,
    Code2,
    Database,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { employeeApi } from "@/lib/api";

export default function EmployeeDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Simple basic check to ensure token is present in localStorage
        if (!localStorage.getItem("employee_access_token")) {
            router.push("/employee-login");
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await employeeApi.post("/employee/auth/logout");
        } catch (error) {
            console.warn("Logout failed on server", error);
        } finally {
            localStorage.removeItem("employee_access_token");
            router.push("/employee-login");
        }
    };

    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-teal-500/30">
            <div className="flex h-screen overflow-hidden">
                {/* Mobile Header & Hamburger */}
                <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-[#0a0f1e] border-b border-white/5 flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <ShieldAlert className="w-4 h-4 text-teal-400" />
                        </div>
                        <span className="font-semibold text-white tracking-wide">Staff Portal</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0f1e] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${isSidebarOpen ? "translate-x-0 top-16" : "-translate-x-full"
                        }`}
                >
                    {/* Logo Handle (Desktop) */}
                    <div className="hidden lg:flex items-center gap-3 p-6 shrink-0 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-lg shadow-teal-500/10">
                            <ShieldAlert className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg tracking-tight">HirePrep</h1>
                            <span className="text-xs text-teal-400/80 uppercase font-bold tracking-widest">
                                Admin
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
                        <Link
                            href="/employee-dashboard"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors" />
                            Metrics & Stats
                        </Link>

                        <Link
                            href="/employee-dashboard/dsa"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Code2 className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                            Manage DSA
                        </Link>

                        <Link
                            href="/employee-dashboard/sql"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Database className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            Manage SQL
                        </Link>
                    </nav>

                    <div className="p-4 shrink-0 border-t border-white/5 bg-white/[0.02]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 custom-scrollbar relative z-10 w-full max-w-[1600px] mx-auto">
                        {children}
                    </main>
                </div>

                {/* Mobile backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
