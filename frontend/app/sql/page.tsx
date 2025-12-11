"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Database, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';

interface SQLChapter {
  id: number;
  title: string;
  content: string;
  order: number;
  problems: SQLProblem[];
}

interface SQLProblem {
  id: number;
  title: string;
  description: string;
  chapter_id: number;
  difficulty: string;
}

export default function SQLDashboard() {
  const [chapters, setChapters] = useState<SQLChapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await api.get('/sql/chapters');
        setChapters(res.data);
      } catch (error) {
        console.error('Failed to fetch chapters');
      }
    };
    fetchChapters();
  }, []);

  const totalPages = Math.ceil(chapters.length / itemsPerPage);
  const currentChapters = chapters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white">
          SQL Mastery
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-2 sticky top-24">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Chapters</h3>
            {chapters.map((chapter, index) => (
                <button
                    key={chapter.id}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                        currentPage === index + 1 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <span className="font-medium truncate">{chapter.title}</span>
                    {currentPage === index + 1 && <ChevronRight className="w-4 h-4" />}
                </button>
            ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
            <div className="grid gap-6">
                {currentChapters.map((chapter) => (
                <div key={chapter.id} className="glass p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">{chapter.title}</h2>
                    </div>
                    
                    <div className="grid gap-3">
                        {chapter.problems.map(problem => (
                            <Link 
                                key={problem.id} 
                                href={`/sql/${problem.id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">{problem.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                ))}

                {chapters.length === 0 && (
                    <div className="text-center py-20 glass rounded-2xl">
                        <p className="text-gray-400">No chapters available yet. Seed the database!</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {chapters.length > 0 && (
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/10">
                    <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
                    >
                    <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <span className="text-gray-500 text-sm">
                        Chapter {currentPage} of {totalPages}
                    </span>

                    <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
                    >
                    Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
