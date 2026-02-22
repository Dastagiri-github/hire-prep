"use client";
import { useEffect, useState } from "react";
import { employeeApi } from "@/lib/api";
import { Trash2, Edit, Plus, Database, AlertCircle, Server } from "lucide-react";

interface SQLChapter {
    id: number;
    title: string;
    content: string;
    order: number;
    problems: SQLProblem[];
}

interface SQLProblem {
    id: number;
    chapter_id: number;
    title: string;
    difficulty: string;
}

export default function SQLManagement() {
    const [chapters, setChapters] = useState<SQLChapter[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const response = await employeeApi.get("/sql/chapters");
            setChapters(response.data);
        } catch {
            alert("Failed to load SQL Chapters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);

    const handleDeleteChapter = async (id: number) => {
        if (!confirm("Are you sure? This deletes ALL problems in the chapter!")) return;
        try {
            await employeeApi.delete(`/employee/dashboard/sql/chapters/${id}`);
            setChapters(chapters.filter(c => c.id !== id));
        } catch {
            alert("Failed to delete chapter");
        }
    };

    const handleDeleteProblem = async (problemId: number, chapterId: number) => {
        if (!confirm("Delete this SQL problem?")) return;
        try {
            await employeeApi.delete(`/employee/dashboard/sql/problems/${problemId}`);
            setChapters(chapters.map(c => {
                if (c.id === chapterId) {
                    return { ...c, problems: c.problems.filter(p => p.id !== problemId) };
                }
                return c;
            }));
        } catch {
            alert("Failed to delete sql problem");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-400" />
                        SQL Content
                    </h1>
                    <p className="text-gray-400 text-sm">Manage educational SQL Chapters and interactive Schema Problems.</p>
                </div>
                <button
                    onClick={() => alert("Implementation placeholder for standard Chapter creation...")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Chapter
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
            ) : chapters.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p>No SQL Chapters found. Start by creating your first curriculum chapter.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {chapters.map(chapter => (
                        <div key={chapter.id} className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                            {/* Chapter Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                        <span className="text-blue-400 text-sm font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">#{chapter.order}</span>
                                        {chapter.title}
                                    </h2>
                                    <p className="text-xs text-gray-400 max-w-2xl line-clamp-1">{chapter.content}</p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <button onClick={() => alert("Placeholder to Add SQL Problem")} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-semibold hover:bg-blue-500/20 transition-colors flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> Problem
                                    </button>
                                    <button onClick={() => alert("Edit Chapter")} className="p-1.5 bg-white/5 text-gray-300 rounded hover:bg-white/10 hover:text-white transition-colors border border-white/10">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteChapter(chapter.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors border border-red-500/20">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Problems Under Chapter */}
                            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                                {chapter.problems.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500 border-t border-white/5 flex items-center justify-center gap-2 bg-white/[0.01]">
                                        <Server className="w-4 h-4" /> No interactive SQL problems yet.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {chapter.problems.map(prob => (
                                            <div key={prob.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${prob.difficulty === "Easy" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : prob.difficulty === "Medium" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"}`} />
                                                    <span className="text-sm font-medium text-gray-200">{prob.title}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => alert("Edit problem setup/solution")} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Edit</button>
                                                    <button onClick={() => handleDeleteProblem(prob.id, chapter.id)} className="text-xs text-red-500/70 hover:text-red-400 font-medium">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
