"use client";
import { useEffect, useState } from "react";
import { employeeApi } from "@/lib/api";
import { Users, Code2, Database, Activity, RefreshCw } from "lucide-react";

interface Metrics {
    users: number;
    problems: number;
    submissions: number;
    sql_problems: number;
}

export default function EmployeeDashboardOverview() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await employeeApi.get("/employee/dashboard/metrics");
            setMetrics(response.data);
        } catch (error) {
            console.error("Failed to fetch employee metrics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Real-time tracking of platform content and user engagement metrics across all languages and chapters.
                    </p>
                </div>

                <button
                    onClick={fetchMetrics}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-all w-full md:w-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {!metrics && loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 animate-pulse h-32" />
                    ))}
                </div>
            ) : metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Users"
                        value={metrics.users.toLocaleString()}
                        icon={<Users className="w-6 h-6 text-purple-400" />}
                        gradient="from-purple-500/20 to-transparent"
                        border="border-purple-500/20"
                    />
                    <MetricCard
                        title="DSA Problems"
                        value={metrics.problems.toLocaleString()}
                        icon={<Code2 className="w-6 h-6 text-amber-400" />}
                        gradient="from-amber-500/20 to-transparent"
                        border="border-amber-500/20"
                    />
                    <MetricCard
                        title="SQL Problems"
                        value={metrics.sql_problems.toLocaleString()}
                        icon={<Database className="w-6 h-6 text-blue-400" />}
                        gradient="from-blue-500/20 to-transparent"
                        border="border-blue-500/20"
                    />
                    <MetricCard
                        title="Total Submissions"
                        value={metrics.submissions.toLocaleString()}
                        icon={<Activity className="w-6 h-6 text-emerald-400" />}
                        gradient="from-emerald-500/20 to-transparent"
                        border="border-emerald-500/20"
                    />
                </div>
            ) : (
                <div className="p-8 text-center text-red-400 glass-panel rounded-2xl border border-red-500/20">
                    Failed to load metrics. Ensure your session is valid.
                </div>
            )}

            {/* Placeholder for future activity charts / graphs */}
            <div className="mt-8 glass-panel rounded-2xl border border-white/10 p-8 h-96 flex flex-col items-center justify-center text-gray-500">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p>Detailed performance charts coming soon</p>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, gradient, border }: { title: string, value: string | number, icon: React.ReactNode, gradient: string, border: string }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-black/40 border p-6 flex flex-col justify-between ${border} hover:border-opacity-50 transition-colors`}>
            <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} opacity-50 blur-xl pointer-events-none`} />
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-gray-400">{title}</p>
            </div>
        </div>
    );
}
