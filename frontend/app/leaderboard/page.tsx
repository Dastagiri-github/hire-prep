"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Trophy, Star, Medal, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface LeaderboardUser {
    id: number;
    name: string;
    username: string;
    total_solved: number;
    reputation: number;
    current_streak: number;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/stats/leaderboard');
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-[#0a0f1c] pt-24 pb-12 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                        <p className="text-gray-400">Loading Top Coders...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#111827] pt-24 pb-12 px-4">
                <div className="max-w-[1000px] mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4 ring-1 ring-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                            <Trophy className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Global Leaderboard</h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Rankings are based on <span className="text-blue-400">Reputation</span> earned by solving problems and maintaining daily streaks.
                        </p>
                    </div>

                    {/* Top 3 Podium (Desktop) */}
                    <div className="hidden md:flex justify-center items-end gap-6 mb-16 h-64">
                        {/* Rank 2 */}
                        {users.length > 1 && (
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)] flex items-center justify-center text-xl font-bold text-white mb-4 relative z-10">
                                    {(users[1].username || users[1].name || "U").substring(0, 2).toUpperCase()}
                                    <div className="absolute -bottom-2 -right-2 bg-slate-400 text-[#0a0f1c] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                </div>
                                <div className="w-32 bg-gradient-to-t from-[#1e293b] to-slate-800/80 rounded-t-xl h-32 flex flex-col justify-end p-4 border-t border-x border-slate-700/50">
                                    <p className="text-slate-300 font-bold text-center truncate w-full">{users[1].username || users[1].name}</p>
                                    <p className="text-yellow-500 font-mono text-center text-sm">{users[1].reputation} Rep</p>
                                </div>
                            </div>
                        )}

                        {/* Rank 1 */}
                        {users.length > 0 && (
                            <div className="flex flex-col items-center animate-fade-in-up z-10">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center text-3xl font-bold text-black mb-4 relative">
                                    <Trophy className="absolute -top-6 text-yellow-500 w-8 h-8 drop-shadow-lg" />
                                    {(users[0].username || users[0].name || "U").substring(0, 2).toUpperCase()}
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">1</div>
                                </div>
                                <div className="w-40 bg-gradient-to-t from-[#1e293b] to-yellow-900/40 rounded-t-xl h-44 flex flex-col justify-end p-4 border-t border-x border-yellow-700/50 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-yellow-500/5 blur-[50px] mix-blend-screen"></div>
                                    <p className="text-white font-bold text-center text-lg truncate w-full">{users[0].username || users[0].name}</p>
                                    <p className="text-yellow-400 font-mono text-center font-bold tracking-wider">{users[0].reputation} Rep</p>
                                </div>
                            </div>
                        )}

                        {/* Rank 3 */}
                        {users.length > 2 && (
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="w-16 h-16 rounded-full bg-amber-900 border-2 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center text-xl font-bold text-white mb-4 relative z-10">
                                    {(users[2].username || users[2].name || "U").substring(0, 2).toUpperCase()}
                                    <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                </div>
                                <div className="w-32 bg-gradient-to-t from-[#1e293b] to-amber-900/40 rounded-t-xl h-24 flex flex-col justify-end p-4 border-t border-x border-amber-800/50">
                                    <p className="text-amber-200 font-bold text-center truncate w-full">{users[2].username || users[2].name}</p>
                                    <p className="text-yellow-500 font-mono text-center text-sm">{users[2].reputation} Rep</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rankings Table */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1e293b]/50 border-b border-gray-800 text-gray-400 text-sm font-medium uppercase tracking-wider">
                                        <th className="p-4 pl-6 text-center w-16">Rank</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4 text-center">Reputation</th>
                                        <th className="p-4 text-center hidden sm:table-cell">Solved</th>
                                        <th className="p-4 text-center hidden md:table-cell">Streak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.id} className="border-b border-gray-800/50 hover:bg-[#1e293b]/50 transition-colors group">
                                            <td className="p-4 pl-6 text-center">
                                                <span className={`font-bold text-lg ${idx === 0 ? 'text-yellow-500' :
                                                    idx === 1 ? 'text-slate-400' :
                                                        idx === 2 ? 'text-amber-600' : 'text-gray-500'
                                                    }`}>#{idx + 1}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                        idx === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/50' :
                                                            idx === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' :
                                                                'bg-gray-800 text-gray-400 border border-gray-700'
                                                        }`}>
                                                        {(user.username || user.name || "U").substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                        {user.username || user.name || "Unknown User"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg font-mono font-bold">
                                                    <Star className="w-3.5 h-3.5 fill-yellow-500/50" />
                                                    {user.reputation}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center hidden sm:table-cell">
                                                <span className="text-gray-300 font-medium">{user.total_solved}</span>
                                            </td>
                                            <td className="p-4 text-center hidden md:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    {user.current_streak > 0 ? (
                                                        <Activity className="w-4 h-4 text-orange-500" />
                                                    ) : (
                                                        <Activity className="w-4 h-4 text-gray-600" />
                                                    )}
                                                    <span className={`${user.current_streak > 0 ? 'text-orange-400' : 'text-gray-500'} font-medium`}>
                                                        {user.current_streak} <span className="text-xs text-gray-500 ml-0.5">days</span>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-500">
                                                No users found. Be the first to earn reputation!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthGuard>
    );
}
