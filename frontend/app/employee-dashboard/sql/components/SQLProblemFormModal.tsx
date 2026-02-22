import React, { useState, useEffect } from "react";
import { employeeApi } from "@/lib/api";
import { X, CheckCircle2 } from "lucide-react";

interface SQLProblem {
    id?: number;
    chapter_id: number;
    title: string;
    description: string;
    difficulty: string;
    setup_sql: string;
    solution_sql: string;
}

interface Props {
    problem?: SQLProblem | null;
    chapterId: number;
    onClose: () => void;
    onSave: (problem: SQLProblem) => void;
}

const emptyProblem: Omit<SQLProblem, "chapter_id"> = {
    title: "",
    description: "",
    difficulty: "Easy",
    setup_sql: "",
    solution_sql: "",
};

export default function SQLProblemFormModal({ problem, chapterId, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<SQLProblem>({ ...emptyProblem, chapter_id: chapterId });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (problem) {
            setFormData(problem);
        }
    }, [problem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formData.id) {
                // According to schemas.py, PUT receives mostly optional fields, but we pass full obj
                const res = await employeeApi.put(`/employee/dashboard/sql/problems/${formData.id}`, formData);
                onSave(res.data);
            } else {
                const res = await employeeApi.post(`/employee/dashboard/sql/problems`, formData);
                onSave(res.data);
            }
        } catch (err) {
            alert("Failed to save SQL problem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0f1e] text-white border border-white/10 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {formData.id ? "Edit SQL Problem" : "Add SQL Problem"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="sql-problem-form" onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50"
                                    placeholder="e.g. Find Highest Salary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50 [&>option]:bg-[#0a0f1e]"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Description / Goal</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 text-sm"
                                placeholder="Write the exact problem question the user must solve..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/10">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between text-gray-300">
                                    <span>Setup SQL Script <span className="text-gray-500 text-xs">(CREATE TABLE, INSERT INTO)</span></span>
                                </label>
                                <textarea
                                    name="setup_sql"
                                    value={formData.setup_sql}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full bg-black/80 font-mono text-sm border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50"
                                    placeholder="CREATE TABLE employees (id INT, salary INT);\nINSERT INTO employees VALUES (1, 1000);"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between text-gray-300">
                                    <span>Expected Solution Query</span>
                                </label>
                                <textarea
                                    name="solution_sql"
                                    value={formData.solution_sql}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full bg-black/80 font-mono text-sm border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50"
                                    placeholder="SELECT MAX(salary) FROM employees;"
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        form="sql-problem-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Problem
                    </button>
                </div>

            </div>
        </div>
    );
}
