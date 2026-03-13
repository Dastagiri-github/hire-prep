"use client";
import { useEffect, useState } from "react";
import { employeeApi } from "@/lib/api";
import { Users, Code2, Database, Activity, RefreshCw, Brain, Shuffle, PlusCircle, Bookmark } from "lucide-react";
import EmployeeAuthGuard from "@/components/EmployeeAuthGuard";
import { Skeleton } from "@/components/Skeleton";

interface Metrics {
    users: number;
    problems: number;
    submissions: number;
    sql_problems: number;
    aptitude_chapters: number;
    aptitude_problems: number;
}

interface AssignPoDForm {
    date: string;
    problem_id: number | '';
    problem_type: string;
}

interface UserStat {
    id: number;
    name: string | null;
    username: string;
    email: string;
    created_at: string;
    total_solved: number;
    total_time_spent_seconds: number;
    reputation: number;
}


export default function EmployeeDashboardOverview() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [podForm, setPodForm] = useState<AssignPoDForm>({
        date: new Date().toISOString().split('T')[0],
        problem_id: '',
        problem_type: 'coding'
    });
    const [podAssigning, setPodAssigning] = useState(false);
    const [podMessage, setPodMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [usersData, setUsersData] = useState<UserStat[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // New additions for Random / Create PoD
    const [activeTab, setActiveTab] = useState<'assign' | 'create'>('assign');
    const [newProblemForm, setNewProblemForm] = useState({
        title: "",
        description: "",
        difficulty: "Easy"
    });
    const [creatingProblem, setCreatingProblem] = useState(false);

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

    const fetchUsersData = async () => {
        setLoadingUsers(true);
        try {
            const response = await employeeApi.get("/employee/dashboard/users");
            setUsersData(response.data);
        } catch (error) {
            console.error("Failed to fetch user stats", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || seconds === 0) return "0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const handleAssignPoD = async (e: React.FormEvent) => {
        e.preventDefault();
        setPodAssigning(true);
        setPodMessage(null);

        try {
            await employeeApi.post("/employee/dashboard/daily-challenge", {
                date: podForm.date,
                problem_id: Number(podForm.problem_id),
                problem_type: podForm.problem_type
            });
            setPodMessage({ type: 'success', text: 'Problem assigned successfully!' });
        } catch (error: any) {
            setPodMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to assign problem.' });
        } finally {
            setPodAssigning(false);
        }
    };

    const handlePickRandom = async () => {
        try {
            const res = await employeeApi.get(`/employee/dashboard/problems/random?problem_type=${podForm.problem_type}`);
            setPodForm({ ...podForm, problem_id: res.data.problem_id });
            setPodMessage({ type: 'success', text: `Random ${podForm.problem_type} problem selected!` });
        } catch (e: any) {
            setPodMessage({ type: 'error', text: 'No problems found for this category.' });
        }
    };

    const handleCreateAndAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingProblem(true);
        setPodMessage(null);
        try {
            // 1. Create the coding problem
            const createRes = await employeeApi.post("/employee/dashboard/problems", {
                title: newProblemForm.title,
                description: newProblemForm.description,
                difficulty: newProblemForm.difficulty,
                tags: ["PoD", "New"],
                companies: [],
                sample_test_cases: [{ input: "", output: "", explanation: "" }],
                hidden_test_cases: [{ input: "", output: "", explanation: "" }]
            });
            const newProblemId = createRes.data.id;

            // 2. Assign as PoD
            await employeeApi.post("/employee/dashboard/daily-challenge", {
                date: podForm.date,
                problem_id: newProblemId,
                problem_type: "coding"
            });

            setPodMessage({ type: 'success', text: `Problem created (ID: ${newProblemId}) and assigned for ${podForm.date}!` });
            setNewProblemForm({ title: "", description: "", difficulty: "Easy" }); // reset
        } catch (error: any) {
            setPodMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create and assign.' });
        } finally {
            setCreatingProblem(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        fetchUsersData();
    }, []);

    return (
        <EmployeeAuthGuard>
            <div className="space-y-8 animate-fade-in pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
                        <p className="text-gray-400 text-sm max-w-2xl">
                            Real-time tracking of platform content and user engagement metrics across all languages and chapters.
                        </p>
                    </div>

                    <button
                        onClick={() => { fetchMetrics(); fetchUsersData(); }}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-all w-full md:w-auto"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loading || loadingUsers) ? 'animate-spin text-teal-400' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {!metrics && loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-40 w-full" />
                        ))}
                    </div>
                ) : metrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        <MetricCard
                            title="Total Users"
                            value={metrics.users.toLocaleString()}
                            icon={<Users className="w-6 h-6 text-blue-400" />}
                            gradient="from-blue-500/20 to-transparent"
                            border="border-blue-500/20"
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
                            title="Aptitude Chapters"
                            value={metrics.aptitude_chapters.toLocaleString()}
                            icon={<Brain className="w-6 h-6 text-purple-400" />}
                            gradient="from-purple-500/20 to-transparent"
                            border="border-purple-500/20"
                        />
                        <MetricCard
                            title="Aptitude Problems"
                            value={metrics.aptitude_problems.toLocaleString()}
                            icon={<Brain className="w-6 h-6 text-pink-400" />}
                            gradient="from-pink-500/20 to-transparent"
                            border="border-pink-500/20"
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

                {/* Quick Actions & Insights Array */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Assign Problem of the Day */}
                    <div className="glass-panel rounded-2xl border border-white/10 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Brain className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-2">Problem of the Day</h2>
                            <p className="text-gray-400 text-sm mb-6">Select an existing problem or create a new one to feature globally.</p>

                            {/* Tabs */}
                            <div className="flex space-x-2 mb-6 p-1 bg-black/40 border border-white/10 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('assign')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'assign' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    <Bookmark className="w-4 h-4" /> Existing
                                </button>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    <PlusCircle className="w-4 h-4" /> Create New
                                </button>
                            </div>

                            {activeTab === 'assign' ? (
                                <form onSubmit={handleAssignPoD} className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400 font-medium">Target Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={podForm.date}
                                                onChange={(e) => setPodForm({ ...podForm, date: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400 font-medium">Problem Type</label>
                                            <select
                                                value={podForm.problem_type}
                                                onChange={(e) => setPodForm({ ...podForm, problem_type: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
                                            >
                                                <option value="coding">DSA (Coding)</option>
                                                <option value="sql">SQL</option>
                                                <option value="aptitude">Aptitude</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs text-gray-400 font-medium">Problem ID</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={podForm.problem_id}
                                                onChange={(e) => setPodForm({ ...podForm, problem_id: e.target.value ? Number(e.target.value) : '' })}
                                                placeholder={`ID for ${podForm.problem_type}...`}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handlePickRandom}
                                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                                            title="Pick Random ID"
                                        >
                                            <Shuffle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {podMessage && (
                                        <div className={`p-3 rounded-lg text-sm border ${podMessage.type === 'success'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}>
                                            {podMessage.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={podAssigning || !podForm.problem_id}
                                        className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {podAssigning ? (
                                            <><RefreshCw className="w-4 h-4 animate-spin" /> Assigning...</>
                                        ) : (
                                            'Assign Featured Problem'
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateAndAssign} className="space-y-4 animate-fade-in">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-medium">Target Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={podForm.date}
                                            onChange={(e) => setPodForm({ ...podForm, date: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-medium">New Problem Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProblemForm.title}
                                            onChange={(e) => setNewProblemForm({ ...newProblemForm, title: e.target.value })}
                                            placeholder="e.g. Validate Binary Search Tree"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs text-gray-400 font-medium">Difficulty</label>
                                            <select
                                                value={newProblemForm.difficulty}
                                                onChange={(e) => setNewProblemForm({ ...newProblemForm, difficulty: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 font-medium">Problem Description (Markdown)</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={newProblemForm.description}
                                            onChange={(e) => setNewProblemForm({ ...newProblemForm, description: e.target.value })}
                                            placeholder="Write the problem statement here..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 resize-none font-mono text-sm"
                                        />
                                    </div>

                                    {podMessage && (
                                        <div className={`p-3 rounded-lg text-sm border ${podMessage.type === 'success'
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}>
                                            {podMessage.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={creatingProblem || !newProblemForm.title || !newProblemForm.description}
                                        className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {creatingProblem ? (
                                            <><RefreshCw className="w-4 h-4 animate-spin" /> Creating & Assigning...</>
                                        ) : (
                                            <><PlusCircle className="w-4 h-4" /> Create & Assign Problem</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Placeholder for future activity charts / graphs */}
                    <div className="glass-panel rounded-2xl border border-white/10 p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500">
                        <Activity className="w-12 h-12 mb-4 opacity-50" />
                        <p>Detailed performance charts coming soon</p>
                    </div>
                </div>

                {/* User Statistics Table */}
                <div className="mt-8 glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
                    <div className="p-6 border-b border-white/5 bg-black/20 flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Registered Users Activity</h2>
                            <p className="text-sm text-gray-400">Detailed performance metrics across all users</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="text-xs uppercase bg-black/40 text-gray-400 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Join Date</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Reputation</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Problems Solved</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Time Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-white/5 animate-pulse">
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-5 w-32 mb-1" />
                                                <Skeleton className="h-3 w-20" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-24" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-6 w-16 ml-auto rounded-full" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-6 w-20 ml-auto rounded-full" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-4 w-12 ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : usersData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No users registered yet.
                                        </td>
                                    </tr>
                                ) : (
                                    usersData.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{user.name || 'Anonymous'}</div>
                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    {user.reputation} pt
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {user.total_solved} solved
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                                                {formatTime(user.total_time_spent_seconds)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </EmployeeAuthGuard>
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
