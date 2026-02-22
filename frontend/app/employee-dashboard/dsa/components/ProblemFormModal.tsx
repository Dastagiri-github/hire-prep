import React, { useState, useEffect } from "react";
import { employeeApi } from "@/lib/api";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";

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

interface Props {
    problem?: Problem | null;
    onClose: () => void;
    onSave: (problem: Problem) => void;
}

const emptyProblem: Problem = {
    title: "",
    description: "",
    difficulty: "Easy",
    tags: [],
    companies: [],
    sample_test_cases: [{ input: "", output: "", explanation: "" }],
    hidden_test_cases: [{ input: "", output: "", explanation: "" }],
};

export default function ProblemFormModal({ problem, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Problem>({ ...emptyProblem });
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

    const handleArrayChange = (field: "tags" | "companies", value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value.split(",").map((s) => s.trim()).filter(Boolean) }));
    };

    const handleTestCaseChange = (type: "sample_test_cases" | "hidden_test_cases", index: number, field: string, value: string) => {
        setFormData((prev) => {
            const cases = [...prev[type]];
            cases[index] = { ...cases[index], [field]: value };
            return { ...prev, [type]: cases };
        });
    };

    const addTestCase = (type: "sample_test_cases" | "hidden_test_cases") => {
        setFormData((prev) => ({
            ...prev,
            [type]: [...prev[type], { input: "", output: "", explanation: "" }],
        }));
    };

    const removeTestCase = (type: "sample_test_cases" | "hidden_test_cases", index: number) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formData.id) {
                const res = await employeeApi.put(`/employee/dashboard/problems/${formData.id}`, formData);
                onSave(res.data);
            } else {
                const res = await employeeApi.post(`/employee/dashboard/problems`, formData);
                onSave(res.data);
            }
        } catch (err) {
            alert("Failed to save problem");
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
                        {formData.id ? "Edit Problem" : "Add New Problem"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="problem-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50"
                                    placeholder="e.g. Two Sum"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50 [&>option]:bg-[#0a0f1e]"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Description (Markdown Supported)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-teal-500/50 font-mono text-sm"
                                placeholder="Write the problem statement here..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags.join(", ")}
                                    onChange={(e) => handleArrayChange("tags", e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50"
                                    placeholder="Array, Hash Table"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Companies (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.companies.join(", ")}
                                    onChange={(e) => handleArrayChange("companies", e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50"
                                    placeholder="Google, Amazon, Meta"
                                />
                            </div>
                        </div>

                        {/* Test Cases */}
                        <div className="space-y-6 pt-6 border-t border-white/10">
                            {["sample_test_cases", "hidden_test_cases"].map((type) => {
                                const cases = formData[type as "sample_test_cases" | "hidden_test_cases"];
                                const isHidden = type === "hidden_test_cases";

                                return (
                                    <div key={type} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-white">{isHidden ? "Hidden Test Cases" : "Sample Test Cases"}</h3>
                                            <button
                                                type="button"
                                                onClick={() => addTestCase(type as any)}
                                                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded-md transition-colors"
                                            >
                                                <Plus className="w-4 h-4" /> Add Case
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {cases.map((tc, index) => (
                                                <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTestCase(type as any, index)}
                                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-mono">Input</label>
                                                            <input
                                                                value={tc.input}
                                                                onChange={(e) => handleTestCaseChange(type as any, index, "input", e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm font-mono focus:border-teal-500/50 outline-none"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-mono">Expected Output</label>
                                                            <input
                                                                value={tc.output}
                                                                onChange={(e) => handleTestCaseChange(type as any, index, "output", e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm font-mono focus:border-teal-500/50 outline-none"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    {!isHidden && (
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-mono">Explanation (Optional)</label>
                                                            <input
                                                                value={tc.explanation || ""}
                                                                onChange={(e) => handleTestCaseChange(type as any, index, "explanation", e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-teal-500/50 outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {cases.length === 0 && (
                                                <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-sm">
                                                    No test cases added.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="problem-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Problem
                    </button>
                </div>

            </div>
        </div>
    );
}
