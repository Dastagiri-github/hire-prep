"use client";
import { useEffect, useState } from "react";
import { employeeApi } from "@/lib/api";
import { Trash2, Edit, Plus, AlertTriangle, Code2 } from "lucide-react";
import ProblemFormModal from "./components/ProblemFormModal";

interface TestCase {
    input: string;
    output: string;
    explanation?: string;
}

interface Problem {
    id?: number;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    companies: string[];
    sample_test_cases: TestCase[];
    hidden_test_cases: TestCase[];
}

export default function DSAManagement() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            // We can securely reuse the public get endpoints for fetching
            const response = await employeeApi.get("/problems/");
            setProblems(response.data);
        } catch (err) {
            setError("Failed to load problems.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this problem? This will also wipe related analytics.")) return;
        try {
            await employeeApi.delete(`/employee/dashboard/problems/${id}`);
            setProblems(problems.filter((p) => p.id !== id));
        } catch (err) {
            alert("Failed to delete problem");
        }
    };

    const handleSaveProblem = (savedProblem: Problem) => {
        if (editingProblem) {
            setProblems(problems.map(p => p.id === savedProblem.id ? savedProblem : p));
        } else {
            setProblems([...problems, savedProblem]);
        }
        setIsModalOpen(false);
        setEditingProblem(null);
    };

    const openAddModal = () => {
        setEditingProblem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (problem: Problem) => {
        setEditingProblem(problem);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Code2 className="w-8 h-8 text-teal-400" />
                        DSA Content
                    </h1>
                    <p className="text-gray-400 text-sm">Create, edit, and organize Data Structures and Algorithms problems.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Problem
                </button>
            </div>

            {error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-panel h-48 rounded-xl animate-pulse border-white/5" />)}
                </div>
            ) : problems.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-gray-500">No DSA problems found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {problems.map(problem => (
                        <div key={problem.id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-colors group flex flex-col justify-between h-full bg-gradient-to-b from-transparent to-black/40">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-white group-hover:text-teal-400 tracking-tight leading-tight line-clamp-2">{problem.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                        problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                            "bg-red-500/10 text-red-400 border border-red-500/20"
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {problem.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                    {problem.tags.length > 3 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                                            +{problem.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => openEditModal(problem)}
                                    className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium flex justify-center items-center gap-1.5 transition-colors border border-white/5"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(problem.id!)}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex justify-center items-center transition-colors border border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ProblemFormModal
                    problem={editingProblem}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProblem}
                />
            )}
        </div>
    );
}
