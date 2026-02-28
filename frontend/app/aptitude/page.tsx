"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Brain, BookOpen, ChevronRight } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface AptitudeChapter {
  id: number;
  title: string;
  content: string;
  order: number;
  problems: AptitudeProblem[];
}

interface AptitudeProblem {
  id: number;
  title: string;
  description: string;
  question_type: string;
  difficulty: string;
  time_limit: number;
}

export default function AptitudeDashboard() {
  const [chapters, setChapters] = useState<AptitudeChapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const problemsPerPage = 6;
  const [problemPageByChapter, setProblemPageByChapter] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await api.get('/aptitude/chapters');
        setChapters(res.data);
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
      }
    };
    fetchChapters();
  }, []);

  const totalPages = Math.max(1, Math.ceil(chapters.length / itemsPerPage));
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

  const getQuestionTypeIcon = (type: string) => {
    return type === 'MCQ' ? '📝' : '🔢';
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Aptitude Mastery
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
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
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
              <div key={chapter.id} className="glass p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">{chapter.title}</h2>
                  <p className="text-gray-400 mt-2">{chapter.content}</p>
                </div>
                
                <div className="grid gap-3">
                  {(() => {
                    const page = problemPageByChapter[chapter.id] || 1;
                    const totalProblemPages = Math.max(1, Math.ceil(chapter.problems.length / problemsPerPage));
                    const visibleProblems = chapter.problems.slice((page - 1) * problemsPerPage, page * problemsPerPage);

                    return (
                      <>
                        {visibleProblems.map(problem => (
                          <Link 
                            key={problem.id} 
                            href={`/aptitude/chapter/${chapter.id}`}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getQuestionTypeIcon(problem.question_type)}</span>
                              <BookOpen className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                              <span className="text-gray-300 group-hover:text-white transition-colors">{problem.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                              <span className="text-gray-500 text-xs flex items-center gap-1">
                                ⏱️ {problem.time_limit}s
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </Link>
                        ))}

                        {chapter.problems.length > problemsPerPage && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              page={page}
                              totalPages={totalProblemPages}
                              onPage={(p) => setProblemPageByChapter(prev => ({ ...prev, [chapter.id]: p }))}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}

            {chapters.length === 0 && (
              <div className="text-center py-20 glass rounded-2xl">
                <p className="text-gray-400">No chapters available yet. Seed the database!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
