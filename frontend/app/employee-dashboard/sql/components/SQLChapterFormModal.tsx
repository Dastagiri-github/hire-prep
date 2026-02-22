import React, { useState, useEffect } from "react";
import { employeeApi } from "@/lib/api";
import { X, CheckCircle2 } from "lucide-react";

interface SQLChapter {
    id?: number;
    title: string;
    content: string;
    order: number;
}

interface Props {
    chapter?: SQLChapter | null;
    onClose: () => void;
    onSave: (chapter: SQLChapter) => void;
    nextOrder: number;
}

const emptyChapter: SQLChapter = {
    title: "",
    content: "",
    order: 1,
};

export default function SQLChapterFormModal({ chapter, onClose, onSave, nextOrder }: Props) {
    const [formData, setFormData] = useState<SQLChapter>({ ...emptyChapter, order: nextOrder });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (chapter) {
            setFormData(chapter);
        }
    }, [chapter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "order" ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formData.id) {
                const res = await employeeApi.put(`/employee/dashboard/sql/chapters/${formData.id}`, formData);
                onSave(res.data);
            } else {
                const res = await employeeApi.post(`/employee/dashboard/sql/chapters`, formData);
                onSave(res.data);
            }
        } catch (err) {
            alert("Failed to save chapter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0f1e] text-white border border-white/10 rounded-2xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {formData.id ? "Edit Chapter" : "Add New Chapter"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form id="chapter-form" onSubmit={handleSubmit} className="space-y-5">

                        <div className="flex gap-4">
                            <div className="w-24 space-y-1">
                                <label className="text-sm font-medium text-gray-300">Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50"
                                    placeholder="e.g. Basic SELECT Statements"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Content / Overview</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 text-sm"
                                placeholder="Brief description of what this chapter covers..."
                            />
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
                        form="chapter-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Chapter
                    </button>
                </div>

            </div>
        </div>
    );
}
