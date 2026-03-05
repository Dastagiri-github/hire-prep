"use client";
import { useEffect, useState } from "react";
import { employeeApi } from "@/lib/api";
import { Trash2, Edit, Plus, Brain, AlertCircle, Clock, Target } from "lucide-react";
import AptitudeChapterFormModal from "./components/AptitudeChapterFormModal";
import AptitudeProblemFormModal from "./components/AptitudeProblemFormModal";
import EmployeeAuthGuard from "@/components/EmployeeAuthGuard";
import { EmployeeChapterSkeleton } from "@/components/Skeleton";

interface AptitudeProblem {
    id: number;
    chapter_id: number;
    title: string;
    description: string;
    question_type: string;
    difficulty: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    time_limit: number;
}

interface AptitudeChapter {
    id: number;
    title: string;
    content: string;
    order: number;
    problems: AptitudeProblem[];
}

export default function EmployeeAptitudePage() {
    const [chapters, setChapters] = useState<AptitudeChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<AptitudeChapter | null>(null);
    const [editingProblem, setEditingProblem] = useState<AptitudeProblem | null>(null);
    const [activeChapterId, setActiveChapterId] = useState<number | null>(null);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const response = await employeeApi.get("/aptitude/chapters");
            setChapters(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to fetch aptitude chapters");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChapter = async (chapterData: Partial<AptitudeChapter>) => {
        try {
            if (editingChapter) {
                await employeeApi.put(`/aptitude/chapters/${editingChapter.id}`, chapterData);
            } else {
                await employeeApi.post("/aptitude/chapters", chapterData);
            }
            fetchChapters();
            setIsChapterModalOpen(false);
            setEditingChapter(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save chapter");
        }
    };

    const handleSaveProblem = async (problemData: Partial<AptitudeProblem>) => {
        try {
            if (editingProblem) {
                await employeeApi.put(`/aptitude/problems/${editingProblem.id}`, problemData);
            } else {
                await employeeApi.post(`/aptitude/problems`, { ...problemData, chapter_id: activeChapterId });
            }
            fetchChapters();
            setIsProblemModalOpen(false);
            setEditingProblem(null);
            setActiveChapterId(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save problem");
        }
    };

    const handleDeleteChapter = async (id: number) => {
        if (!confirm("Are you sure you want to delete this chapter and all its problems?")) return;

        try {
            await employeeApi.delete(`/aptitude/chapters/${id}`);
            fetchChapters();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to delete chapter");
        }
    };

    const handleDeleteProblem = async (id: number) => {
        if (!confirm("Are you sure you want to delete this problem?")) return;

        try {
            await employeeApi.delete(`/aptitude/problems/${id}`);
            fetchChapters();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to delete problem");
        }
    };

    const openAddChapter = () => {
        setEditingChapter(null);
        setIsChapterModalOpen(true);
    };

    const openEditChapter = (chapter: AptitudeChapter) => {
        setEditingChapter(chapter);
        setIsChapterModalOpen(true);
    };

    const openAddProblem = (chapterId: number) => {
        setActiveChapterId(chapterId);
        setEditingProblem(null);
        setIsProblemModalOpen(true);
    };

    const openEditProblem = (problem: AptitudeProblem, chapterId: number) => {
        setActiveChapterId(chapterId);
        setEditingProblem(problem);
        setIsProblemModalOpen(true);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getQuestionTypeIcon = (type: string) => {
        return type === 'MCQ' ? '📝' : '🔢';
    };



    return (
        <EmployeeAuthGuard>
            <div className="space-y-8 animate-fade-in pb-12 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Brain className="w-8 h-8 text-purple-400" />
                            Aptitude Content
                        </h1>
                        <p className="text-gray-400 text-sm">Create, edit, and organize aptitude chapters and problems.</p>
                    </div>
                    <button
                        onClick={openAddChapter}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Chapter
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <EmployeeChapterSkeleton key={i} />)}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">{chapter.title}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{chapter.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-4 h-4" />
                                                    {chapter.problems?.length || 0} problems
                                                </span>
                                                <span>Order: {chapter.order}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openAddProblem(chapter.id)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Add Problem"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditChapter(chapter)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit Chapter"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChapter(chapter.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Chapter"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {chapter.problems && chapter.problems.length > 0 && (
                                    <div className="p-6 space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Problems</h4>
                                        <div className="space-y-3">
                                            {chapter.problems.map((problem) => (
                                                <div key={problem.id} className="bg-black/30 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg">{getQuestionTypeIcon(problem.question_type)}</span>
                                                                <h5 className="font-medium text-white">{problem.title}</h5>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                                    {problem.difficulty}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{problem.description}</p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {problem.time_limit}s
                                                                </span>
                                                                <span>Type: {problem.question_type}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-4">
                                                            <button
                                                                onClick={() => openEditProblem(problem, chapter.id)}
                                                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                                                title="Edit Problem"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProblem(problem.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                                title="Delete Problem"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {chapters.length === 0 && !loading && (
                    <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Aptitude Chapters Yet</h3>
                        <p className="text-gray-400 mb-6">Start by creating your first aptitude chapter</p>
                        <button
                            onClick={openAddChapter}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Chapter
                        </button>
                    </div>
                )}

                {isChapterModalOpen && (
                    <AptitudeChapterFormModal
                        chapter={editingChapter}
                        onClose={() => setIsChapterModalOpen(false)}
                        onSave={handleSaveChapter}
                    />
                )}

                {isProblemModalOpen && activeChapterId !== null && (
                    <AptitudeProblemFormModal
                        problem={editingProblem}
                        chapterId={activeChapterId}
                        onClose={() => setIsProblemModalOpen(false)}
                        onSave={handleSaveProblem}
                    />
                )}
            </div>
        </EmployeeAuthGuard>
    );
}
